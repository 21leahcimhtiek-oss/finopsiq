"use client";

import { ChevronDownIcon, BuildingIcon } from "lucide-react";

interface Props {
  orgName?: string;
}

export default function OrgSwitcher({ orgName = "My Organization" }: Props) {
  return (
    <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="w-6 h-6 bg-primary-100 rounded flex items-center justify-center flex-shrink-0">
        <BuildingIcon className="w-3.5 h-3.5 text-primary-600" />
      </div>
      <span className="flex-1 text-left truncate font-medium">{orgName}</span>
      <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </button>
  );
}