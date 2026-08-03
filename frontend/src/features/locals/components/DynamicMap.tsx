"use client";

import dynamic from "next/dynamic";
import { LocalAssembly } from "../services/local.service";

const LocalMap = dynamic(() => import("./LocalMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] w-full items-center justify-center rounded-xl border bg-gray-100 text-gray-500">
      Loading interactive map...
    </div>
  ),
});

interface Props {
  locals: LocalAssembly[];
}

export default function DynamicMap({ locals }: Props) {
  return <LocalMap locals={locals} />;
}