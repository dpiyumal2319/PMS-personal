import React, { Suspense } from "react";

import { redirect } from "next/navigation";

export default async function InventoryCost() {
  redirect("cost-management/analysis");
}
