import { requirePermissions } from "@carbon/auth/auth.server";
import { error } from "@carbon/auth";
import { flash } from "@carbon/auth/session.server";
import { validationError, validator } from "@carbon/form";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import { partValidator, upsertPart, getPart } from "~/modules/items";
import { PartForm } from "~/modules/items/ui/Parts";
import { setCustomFields } from "~/utils/form";
import { path } from "~/utils/path";
import { useParams } from "@remix-run/react";
import { useRouteData } from "~/hooks";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    view: "parts",
    bypassRls: true,
  });
  const { itemId } = params;
  if (!itemId) throw new Error("Could not find itemId");

  const [part, itemData] = await Promise.all([
    getPart(client, itemId, companyId),
    client
      .from("item")
      .select("barcodeUploadId, modelUploadId")
      .eq("id", itemId)
      .single(),
  ]);

  // Fetch barcode data if barcodeUploadId exists
  let barcode = { data: null, error: null };
  if (itemData.data?.barcodeUploadId) {
    barcode = await client
      .from("barcodeUpload")
      .select("id, imagePath, name, size, serialNumber")
      .eq("id", itemData.data.barcodeUploadId)
      .single();
  }

  // Fetch model data if modelUploadId exists
  let model = { data: null, error: null };
  if (itemData.data?.modelUploadId) {
    model = await client
      .from("modelUpload")
      .select("id, modelPath, name, size")
      .eq("id", itemData.data.modelUploadId)
      .single();
  }

  if (!part.data) throw new Error("Could not find part data");

  // Merge the part data with barcode and model data
  const initialValues = {
    ...part.data,
    serialNumber: barcode.data?.serialNumber,
    barcodeUploadId: itemData.data?.barcodeUploadId,
    barcodeFileName: barcode.data?.name, // Add actual file name
    modelUploadId: itemData.data?.modelUploadId,
    modelFileName: model.data?.name, // Add actual file name
  };

  // Debug logging
  console.log("Edit route debug:", {
    itemId,
    barcodeUploadId: itemData.data?.barcodeUploadId,
    barcodeData: barcode.data,
    serialNumber: barcode.data?.serialNumber,
    initialValues,
  });

  return json({ initialValues });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { client, userId } = await requirePermissions(request, {
    update: "parts",
  });
  const { itemId } = params;
  if (!itemId) throw new Error("Could not find itemId");
  const formData = await request.formData();
  const validation = await validator(partValidator).validate(formData);
  if (validation.error) {
    return validationError(validation.error);
  }
  const updatePart = await upsertPart(client, {
    ...validation.data,
    id: itemId,
    customFields: setCustomFields(formData),
    updatedBy: userId,
  });
  if (updatePart.error) {
    return redirect(
      path.to.part(itemId),
      await flash(request, error(updatePart.error, "Failed to update part"))
    );
  }
  return redirect(path.to.part(itemId));
}

export default function EditPartRoute() {
  const { itemId } = useParams();
  const data = useRouteData<{ initialValues: any }>(path.to.editPart(itemId!));
  const initialValues = data?.initialValues ?? {};
  return (
    <div className="max-w-4xl w-full p-2 sm:p-0 mx-auto mt-0 md:mt-8">
      <PartForm initialValues={initialValues} />
    </div>
  );
}
