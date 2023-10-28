"use client";
//THIS FILE IS FOR EMAIL POPUP AND SEND MAIL

import React, { FormEvent, Fragment } from "react";
import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import { addUserEmailToProduct } from "@/lib/actions/index";

interface Props {
  productId: string;
}

const Modal = ({ productId }: Props) => {
  let [isOpen, setIsOpen] = useState(true);

  const [isSubmitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    //FormEvent<HTMLFormElement> is used to specify the type of the e parameter in the handleSubmit function If you simply write e instead of specifying the type as FormEvent<HTMLFormElement>, TypeScript will still allow it, but you lose some of the benefits that TypeScript provides in terms of type checking and code documentation.
    // prevent the page to reload
    e.preventDefault();
    setSubmitting(true);

    await addUserEmailToProduct(productId, email);

    setSubmitting(false);
    setEmail("");
    closeModel();
  };

  const openModel = () => setIsOpen(true);

  const closeModel = () => setIsOpen(false);

  return (
    <>
      <button type="button" className="btn" onClick={openModel}>
        Track
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" onClose={closeModel} className="dialog-container">
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0"></Dialog.Overlay>
            </Transition.Child>

            {/* just for making model align middle trick */}
            <span className="inline-block h-screen align-middle" />

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="Opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveto="opacity-0 scale-95"
            >
              <div className="dialog-content">
                <div className="flex flex-col">
                  <div className="flex justify-between">
                    <div className="p-3 border border-gray-200 rounded-10">
                      <Image
                        src="/assets/icons/logo.svg"
                        alt="logo"
                        width={28}
                        height={28}
                      />
                    </div>
                    <Image
                      src="/assets/icons/x-close.svg"
                      alt="close"
                      height={24}
                      width={24}
                      className="cursor-pointer"
                      onClick={closeModel}
                    />
                  </div>
                  <h4 className="dialog-head_text">
                    Stay updated with product pricing alerts right in your
                    inbox!
                  </h4>

                  <p className="text-sm text-gray-600 mt-2">
                    Never miss a bargain again with our timely alerts!
                  </p>
                </div>

                <form className="flex flex-col mt-5" onSubmit={handleSubmit}>
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email addresh
                  </label>
                  <div className="dialog-input_container">
                    <Image
                      src="/assets/icons/mail.svg"
                      alt="mail"
                      height={18}
                      width={18}
                    />
                    <input
                      required
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email addresh"
                      className=" dialog-input"
                    />
                  </div>

                  <button type="submit" className="dialog-btn">
                    {isSubmitting ? "Submitting..." : "Track"}
                  </button>
                </form>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Modal;
