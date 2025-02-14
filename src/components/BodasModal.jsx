import { AppContext } from "@/Context/AppContext";
import Image from "next/image";
import React, { useContext, useState } from "react";

const BodasModal = () => {

  const {traduccion} = useContext(AppContext);

  const [isOpen, setIsOpen] = useState(true);

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 md:max-w-lg lg:max-w-xl">
          {/* Modal Header */}
          <div className="relative">
            <div className="h-[300px] w-full">

            <Image
              src="/assets/images/bodasModal.png"
              alt="Traslados para bodas"
              layout="fill"
              objectFit="cover"
              className="w-full h-64 object-cover rounded-t-lg"
              />
              </div>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 text-gray-600 hover:bg-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {traduccion.bodasModal.title}
            </h2>
            <p className="text-gray-600 mb-6">
              {traduccion.bodasModal.description}
            </p>
            <button
              onClick={() =>
                window.open(
                  "https://wa.me/524151393219?text=Hola, me gustaría cotizar un servicio de traslado para bodas",
                  "_blank"
                )
              }
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-lg"
            >
              {traduccion.bodasModal.button}
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default BodasModal;
