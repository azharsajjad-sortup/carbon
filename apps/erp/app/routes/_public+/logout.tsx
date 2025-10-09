import { assertIsPost , getCarbonServiceRole } from "@carbon/auth";
import {
  destroyAuthSession,
  getAuthSession,
} from "@carbon/auth/session.server";
import { updateEmployeeStatus } from "~/modules/users";
import type { ActionFunctionArgs } from "@vercel/remix";
import { redirect } from "@vercel/remix";

import { path } from "~/utils/path";

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);

  // Get user info from session before destroying it
  const authSession = await getAuthSession(request);

  if (authSession?.userId && authSession?.companyId) {
    // Update employee status to Unavailable on logout
    await updateEmployeeStatus(
      getCarbonServiceRole(),
      authSession.userId,
      authSession.companyId,
      "3"
    );
  }

  return destroyAuthSession(request);
}

export async function loader() {
  throw redirect(path.to.root);
}
