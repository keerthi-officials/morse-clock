"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface BaseProps {
  children: React.ReactNode;
}

interface RootModalProps extends BaseProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface ModalProps extends BaseProps {
  className?: string;
  asChild?: true;
}

const ModalContext = React.createContext<{ isMobile: boolean }>({
  isMobile: false,
});

const useModalContext = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error(
      "Modal components cannot be rendered outside the Modal Context",
    );
  }
  return context;
};

const Modal = ({ children, ...props }: RootModalProps) => {
  const isMobile = useIsMobile();
  const Modal = isMobile ? Drawer : Dialog;

  return (
    <ModalContext.Provider value={{ isMobile }}>
      <Modal {...props} {...(isMobile && { autoFocus: true })}>
        {children}
      </Modal>
    </ModalContext.Provider>
  );
};

const ModalTrigger = ({ className, children, ...props }: ModalProps) => {
  const { isMobile } = useModalContext();
  const ModalTrigger = isMobile ? DrawerTrigger : DialogTrigger;

  return (
    <ModalTrigger className={className} {...props}>
      {children}
    </ModalTrigger>
  );
};

const ModalClose = ({ className, children, ...props }: ModalProps) => {
  const { isMobile } = useModalContext();
  const ModalClose = isMobile ? DrawerClose : DialogClose;

  return (
    <ModalClose className={className} {...props}>
      {children}
    </ModalClose>
  );
};

const ModalContent = ({ className, children, ...props }: ModalProps) => {
  const { isMobile } = useModalContext();

  if (isMobile) {
    return (
      <DrawerContent className={className} {...props}>
        {children}
      </DrawerContent>
    );
  }

  return (
    <DialogContent showCloseButton={false} className={className} {...props}>
      {children}
    </DialogContent>
  );
};
const ModalDescription = ({
  className,
  children,
  ...props
}: ModalProps) => {
  const { isMobile } = useModalContext();
  const ModalDescription = isMobile ? DrawerDescription : DialogDescription;

  return (
    <ModalDescription className={className} {...props}>
      {children}
    </ModalDescription>
  );
};

const ModalHeader = ({ className, children, ...props }: ModalProps) => {
  const { isMobile } = useModalContext();
  const ModalHeader = isMobile ? DrawerHeader : DialogHeader;

  return (
    <ModalHeader className={className} {...props}>
      {children}
    </ModalHeader>
  );
};

const ModalTitle = ({ className, children, ...props }: ModalProps) => {
  const { isMobile } = useModalContext();
  const ModalTitle = isMobile ? DrawerTitle : DialogTitle;

  return (
    <ModalTitle className={className} {...props}>
      {children}
    </ModalTitle>
  );
};

const ModalBody = ({ className, children, ...props }: ModalProps) => {
  return (
    <div className={cn("px-4 md:px-0", className)} {...props}>
      {children}
    </div>
  );
};

const ModalFooter = ({ className, children, ...props }: ModalProps) => {
  const { isMobile } = useModalContext();
  const ModalFooter = isMobile ? DrawerFooter : DialogFooter;

  return (
    <ModalFooter className={className} {...props}>
      {children}
    </ModalFooter>
  );
};

export {
  Modal,
  ModalTrigger,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
};
