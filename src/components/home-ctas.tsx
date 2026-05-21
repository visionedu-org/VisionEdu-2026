"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

function setLoginRole(role: "student" | "teacher") {
  sessionStorage.setItem("visionedu_login_role", role);
}

export function HomeCtas() {
  return (
    <div className="pt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Button
        nativeButton={false}
        render={
          <Link
            href="/login"
            onClick={() => setLoginRole("student")}
            className="w-full min-h-11 rounded-2xl"
          />
        }
        className="w-full min-h-11"
      >
        Sou aluno
      </Button>
      <Button
        variant="outline"
        nativeButton={false}
        render={
          <Link
            href="/login"
            onClick={() => setLoginRole("teacher")}
            className="w-full min-h-11 rounded-2xl"
          />
        }
        className="w-full min-h-11"
      >
        Sou professor
      </Button>
    </div>
  );
}
