import { Dialog, RadioGroup, Transition } from "@headlessui/react";
import type { users } from "@prisma/client";
import { Fragment, useState } from "react";

import type { AuthorProfile } from "@server/db";

type TipModalProps = {
  author: AuthorProfile;
  user: users | null;
};
export default function MyModal({ author, user }: TipModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <button onClick={openModal} className="btn btn-info font-bold mt-6">
        Tip Author
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Tip {author.name}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Show your appreciation for our author's hard work and dedication by leaving a
                      tip - it's a small gesture that makes a big difference! ✨🙌
                    </p>
                    <TipRadioGroup user={user} author={author} />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

const plans = [
  {
    name: "Startup",
    value: 50,
  },
  {
    name: "Business",
    value: 100,
  },
  {
    name: "Enterprise",
    value: 150,
  },
  {
    name: "Startup",
    value: 200,
  },
  {
    name: "Business",
    value: 250,
  },
  {
    name: "Enterprise",
    value: 300,
  },
];

type TipRadioGroupProps = {
  author: AuthorProfile;
  user: users | null;
};

function TipRadioGroup({ author, user }: TipRadioGroupProps) {
  const [selected, setSelected] = useState(plans[0].value);

  return (
    <div className="w-full px-2 py-8">
      <form action="/tip" className="mx-auto w-full max-w-md">
        <RadioGroup value={selected} onChange={setSelected}>
          <RadioGroup.Label className="sr-only">Tip Amounts</RadioGroup.Label>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <RadioGroup.Option
                key={plan.name}
                value={plan.value}
                className={({ active, checked }) =>
                  `${
                    active
                      ? "ring-2 ring-white ring-opacity-60 ring-offset-2 ring-offset-sky-300"
                      : ""
                  }
                  ${checked ? "bg-ocean-500 text-white" : "border"}
                    relative flex cursor-pointer rounded-lg px-5 py-4 shadow-sm focus:outline-none`
                }
              >
                {({ checked }) => (
                  <>
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <RadioGroup.Label
                            as="p"
                            className={`font-medium  ${checked ? "text-white" : "text-gray-900"}`}
                          >
                            R{plan.value}
                          </RadioGroup.Label>
                          <RadioGroup.Description
                            as="span"
                            className={`inline ${checked ? "text-sky-100" : "text-gray-500"}`}
                          ></RadioGroup.Description>
                        </div>
                      </div>
                      {checked && (
                        <div className="shrink-0 text-white">
                          <CheckIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>
        {!user && (
          <div data-theme="light" className="bg-white">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">What is your name?</span>
              </label>
              <input
                required
                type="text"
                name="customerName"
                placeholder="Type here"
                className="input input-bordered w-full "
              />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">What is your email?</span>
              </label>
              <input
                required
                type="email"
                name="customerEmail"
                placeholder="Type here"
                className="input input-bordered w-full "
              />
            </div>
          </div>
        )}
        <input type="hidden" name="tipAmount" value={selected} />
        <input type="hidden" name="authorId" value={author.id} />
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            //onClick={closeModal}
          >
            Tip Author
          </button>
        </div>
      </form>
    </div>
  );
}

type CheckIconProps = {
  className: string;
};
function CheckIcon(props: CheckIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
      <path
        d="M7 13l3 3 7-7"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
