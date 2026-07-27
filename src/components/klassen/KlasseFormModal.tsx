"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/shared/Modal";

type KlasseFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
};

export const KlasseFormModal = ({ open, onOpenChange, onSubmit }: KlasseFormProps) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName("");
  }, [open]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim());
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Neue Klasse"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={() => handleSubmit()}>Speichern</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z. B. 5a"
          autoFocus
        />
      </form>
    </Modal>
  );
};
