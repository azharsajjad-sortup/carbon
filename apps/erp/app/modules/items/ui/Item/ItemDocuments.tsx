import { useCarbon } from "@carbon/auth";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  File,
  HStack,
  IconButton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  toast,
  Tr,
} from "@carbon/react";
import { convertKbToString } from "@carbon/utils";
import { LuAxis3D, LuEllipsisVertical, LuUpload } from "react-icons/lu";
import { DocumentPreview, FileDropzone, Hyperlink } from "~/components";
import DocumentIcon from "~/components/DocumentIcon";
import type { MethodItemType, OptimisticFileObject } from "~/modules/shared";
import { getDocumentType } from "~/modules/shared";
import type { ItemFile } from "../../types";

import { Link, useFetchers, useRevalidator, useSubmit } from "@remix-run/react";
import type { FileObject } from "@supabase/storage-js";
import type { ChangeEvent } from "react";
import { useCallback } from "react";
import { usePermissions, useUser } from "~/hooks";
import type { ModelUpload , BarcodeUpload } from "~/types";
import { path } from "~/utils/path";
import { stripSpecialCharacters } from "~/utils/string";

type ItemDocumentsProps = {
  files: ItemFile[];
  itemId: string;
  modelUpload?: ModelUpload;
  barcodeUpload?: BarcodeUpload;
  type: MethodItemType;
};

const ItemDocuments = ({
  files,
  itemId,
  modelUpload,
  barcodeUpload,
  type,
}: ItemDocumentsProps) => {
  const {
    canDelete,
    download,
    downloadModel,
    deleteFile,
    deleteModel,
    deleteBarcode,
    getPath,
    getModelPath,
    upload,
  } = useItemDocuments({
    itemId,
    type,
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      upload(acceptedFiles);
    },
    [upload]
  );

  const attachmentsByName = new Map<string, FileObject | OptimisticFileObject>(
    files.map((file) => [file.name, file])
  );
  const pendingItems = usePendingItems();
  for (let pendingItem of pendingItems) {
    let item = attachmentsByName.get(pendingItem.name);
    let merged = item ? { ...item, ...pendingItem } : pendingItem;
    attachmentsByName.set(pendingItem.name, merged);
  }

  const allFiles = Array.from(attachmentsByName.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  ) as FileObject[];

  const getBarcodePreviewUrl = (barcode: BarcodeUpload) =>
    barcode?.barcodePath
      ? path.to.file.previewFile(`private/${barcode.barcodePath}`)
      : "";

  const downloadBarcode = async (barcode: BarcodeUpload) => {
    if (!barcode?.barcodePath || !barcode?.barcodeName) {
      toast.error("Barcode data is missing");
      return;
    }
    const url = getBarcodePreviewUrl(barcode);
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = blobUrl;
    a.download = barcode.barcodeName;
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  };

  return (
    <Card className="flex-grow">
      <HStack className="justify-between items-start">
        <CardHeader>
          <CardTitle>Files</CardTitle>
          <CardDescription>Item documents</CardDescription>
        </CardHeader>
        <CardAction>
          <ItemDocumentForm type={type} itemId={itemId} />
        </CardAction>
      </HStack>
      <CardContent>
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Size</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {modelUpload?.modelId && (
              <Tr>
                <Td>
                  <HStack>
                    <LuAxis3D className="text-emerald-500 w-6 h-6" />
                    <Hyperlink target="_blank" to={getModelPath(modelUpload)}>
                      {modelUpload.modelName}
                    </Hyperlink>
                  </HStack>
                </Td>
                <Td className="text-xs font-mono">
                  {modelUpload.modelSize
                    ? convertKbToString(
                        Math.floor((modelUpload.modelSize ?? 0) / 1024)
                      )
                    : "--"}
                </Td>
                <Td>
                  <div className="flex justify-end w-full">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <IconButton
                          aria-label="More"
                          icon={<LuEllipsisVertical />}
                          variant="secondary"
                        />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                          <Link to={getModelPath(modelUpload)}>View</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => downloadModel(modelUpload)}
                        >
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          destructive
                          disabled={!canDelete}
                          onClick={() => deleteModel()}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Td>
              </Tr>
            )}
            {barcodeUpload?.barcodeId && (
              <Tr>
                <Td>
                  <HStack>
                    <DocumentIcon type="Image" />
                    <Hyperlink
                      target="_blank"
                      to={getBarcodePreviewUrl(barcodeUpload)}
                    >
                      {barcodeUpload.barcodeName ?? "Barcode image"}
                    </Hyperlink>
                  </HStack>
                </Td>
                <Td className="text-xs font-mono">
                  {barcodeUpload.barcodeSize
                    ? convertKbToString(
                        Math.floor((barcodeUpload.barcodeSize ?? 0) / 1024)
                      )
                    : "--"}
                </Td>
                <Td>
                  <div className="flex justify-end w-full">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <IconButton
                          aria-label="More"
                          icon={<LuEllipsisVertical />}
                          variant="secondary"
                        />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                          <Link to={getBarcodePreviewUrl(barcodeUpload)}>
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => downloadBarcode(barcodeUpload)}
                        >
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          destructive
                          disabled={!canDelete}
                          onClick={() =>
                            deleteBarcode(barcodeUpload.barcodeId ?? "")
                          }
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Td>
              </Tr>
            )}
            {allFiles.map((file) => {
              const type = getDocumentType(file.name);
              return (
                <Tr key={file.id}>
                  <Td>
                    <HStack>
                      <DocumentIcon type={type} />
                      <span
                        className="font-medium"
                        onClick={() => {
                          if (["PDF", "Image"].includes(type)) {
                            window.open(
                              path.to.file.previewFile(
                                `${"private"}/${getPath(file)}`
                              ),
                              "_blank"
                            );
                          } else {
                            download(file);
                          }
                        }}
                      >
                        {["PDF", "Image"].includes(type) ? (
                          <DocumentPreview
                            bucket="private"
                            pathToFile={getPath(file)}
                            // @ts-ignore
                            type={type}
                          >
                            {file.name}
                          </DocumentPreview>
                        ) : (
                          file.name
                        )}
                      </span>
                    </HStack>
                  </Td>
                  <Td className="text-xs font-mono">
                    {convertKbToString(
                      Math.floor((file.metadata?.size ?? 0) / 1024)
                    )}
                  </Td>
                  <Td>
                    <div className="flex justify-end w-full">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <IconButton
                            aria-label="More"
                            icon={<LuEllipsisVertical />}
                            variant="secondary"
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => download(file)}>
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            destructive
                            disabled={!canDelete}
                            onClick={() => deleteFile(file)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Td>
                </Tr>
              );
            })}
            {allFiles.length === 0 && !modelUpload && !barcodeUpload && (
              <Tr>
                <Td
                  colSpan={24}
                  className="py-8 text-muted-foreground text-center"
                >
                  No files
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
        <FileDropzone onDrop={onDrop} />
      </CardContent>
    </Card>
  );
};

export default ItemDocuments;

type ItemDocumentFormProps = {
  itemId: string;
  type: MethodItemType;
};

const ItemDocumentForm = ({ itemId, type }: ItemDocumentFormProps) => {
  const permissions = usePermissions();
  const { upload } = useItemDocuments({ itemId, type });

  const uploadFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      upload(Array.from(e.target.files));
    }
  };

  return (
    <File
      isDisabled={!permissions.can("update", "parts")}
      leftIcon={<LuUpload />}
      onChange={uploadFiles}
      multiple
    >
      New
    </File>
  );
};

type Props = {
  itemId: string;
  type: MethodItemType;
};

export const useItemDocuments = ({ itemId, type }: Props) => {
  const permissions = usePermissions();
  const revalidator = useRevalidator();
  const { carbon } = useCarbon();
  const { company } = useUser();
  const submit = useSubmit();

  const canDelete = permissions.can("delete", "parts");
  const getPath = useCallback(
    (file: { name: string }) => {
      return `${company.id}/parts/${itemId}/${stripSpecialCharacters(
        file.name
      )}`;
    },
    [company.id, itemId]
  );

  const deleteFile = useCallback(
    async (file: FileObject) => {
      const fileDelete = await carbon?.storage
        .from("private")
        .remove([getPath(file)]);

      if (!fileDelete || fileDelete.error) {
        toast.error(fileDelete?.error?.message || "Error deleting file");
        return;
      }

      toast.success("File deleted successfully");
      revalidator.revalidate();
    },
    [getPath, carbon?.storage, revalidator]
  );

  const deleteModel = useCallback(async () => {
    if (!carbon) return;

    const { error } = await carbon
      .from("item")
      .update({ modelUploadId: null })
      .eq("id", itemId);
    if (error) {
      toast.error("Error removing model from item");
      return;
    }
    toast.success("Model removed from item");
    revalidator.revalidate();
  }, [carbon, itemId, revalidator]);

  const downloadModel = useCallback(
    async (model: ModelUpload) => {
      if (!model.modelPath || !model.modelName) {
        toast.error("Model data is missing");
        return;
      }

      if (!model.modelPath || !model.modelName) {
        toast.error("Model data is missing");
        return;
      }

      const url = path.to.file.previewFile(`private/${model.modelPath}`);
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.href = blobUrl;
        a.download = model.modelName;
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      } catch (error) {
        toast.error("Error downloading file");
        console.error(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const deleteBarcode = useCallback(
    async (barcodeId: string) => {
      if (!carbon) return;
      // Mirror model behavior: only clear the single pointer on the item
      const { error } = await carbon
        .from("item")
        .update({ barcodeUploadId: null } as any)
        .eq("id", itemId)
        .eq("barcodeUploadId", barcodeId);
      if (error) {
        toast.error("Error removing barcode image from item");
        return;
      }
      toast.success("Barcode image removed");
      revalidator.revalidate();
    },
    [carbon, itemId, revalidator]
  );

  const download = useCallback(
    async (file: FileObject) => {
      const url = path.to.file.previewFile(`private/${getPath(file)}`);
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.href = blobUrl;
        a.download = file.name;
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      } catch (error) {
        toast.error("Error downloading file");
        console.error(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getPath]
  );

  const getModelPath = useCallback((model: ModelUpload) => {
    if (!model?.modelId) {
      return "";
    }
    return path.to.file.cadModel(model.modelId);
  }, []);

  const upload = useCallback(
    async (files: File[]) => {
      if (!carbon) {
        toast.error("Carbon client not available");
        return;
      }

      for (const file of files) {
        toast.info(`Uploading ${file.name}`);
        const fileName = getPath(file);

        const fileUpload = await carbon.storage
          .from("private")
          .upload(fileName, file, {
            cacheControl: `${12 * 60 * 60}`,
            upsert: true,
          });

        if (fileUpload.error) {
          toast.error(`Failed to upload file: ${file.name}`);
        } else if (fileUpload.data?.path) {
          toast.success(`Uploaded: ${file.name}`);
          const formData = new FormData();
          formData.append("path", fileUpload.data.path);
          formData.append("name", file.name);
          formData.append("size", Math.round(file.size / 1024).toString());
          formData.append("sourceDocument", type);
          formData.append("sourceDocumentId", itemId);

          submit(formData, {
            method: "post",
            action: path.to.newDocument,
            navigate: false,
            fetcherKey: `item:${file.name}`,
          });
        }
      }
      revalidator.revalidate();
    },
    [getPath, carbon, revalidator, submit, type, itemId]
  );

  return {
    canDelete,
    deleteFile,
    deleteModel,
    deleteBarcode,
    download,
    downloadModel,
    getPath,
    getModelPath,
    upload,
  };
};

const usePendingItems = () => {
  type PendingItem = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };

  return useFetchers()
    .filter((fetcher): fetcher is PendingItem => {
      return fetcher.formAction === path.to.newDocument;
    })
    .reduce<OptimisticFileObject[]>((acc, fetcher) => {
      const path = fetcher.formData.get("path") as string;
      const name = fetcher.formData.get("name") as string;
      const size = parseInt(fetcher.formData.get("size") as string, 10) * 1024;

      if (path && name && size) {
        const newItem: OptimisticFileObject = {
          id: path,
          name: name,
          bucket_id: "private",
          bucket: "private",
          metadata: {
            size,
            mimetype: getDocumentType(name),
          },
        };
        return [...acc, newItem];
      }
      return acc;
    }, []);
};
