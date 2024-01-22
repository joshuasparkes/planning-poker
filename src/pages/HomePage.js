import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  db,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "../firebase"; // Import the necessary functions

const HomePage = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateBoard = async () => {
    const boardCode = Math.random().toString(36).substring(2, 8);
    try {
      const boardRef = await addDoc(collection(db, "boards"), {
        code: boardCode,
        createdAt: serverTimestamp(),
      });
      console.log("Board created with ID:", boardRef.id);
      navigate(`/board/${boardCode}`);
    } catch (error) {
      console.error("Error creating new board: ", error);
    }
  };

  const handleJoinBoard = async (event) => {
    event.preventDefault();
    const boardCode = event.target.elements.boardCode.value;
    const q = query(collection(db, "boards"), where("code", "==", boardCode));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      // No such document!
      setErrorMessage("Wrong code. Please try again.");
    } else {
      // Document exists, navigate to the board
      navigate(`/devboard/${boardCode}`);
    }
  };

  return (
    <div className="flex flex-col w-80 justify-center mx-auto items-center h-screen">
      <img
        height={200}
        width={200}
        className="mx-auto mb-10"
        alt="pascal"
        src="./pascal.png"
      />
      <h1 className="text-lg font-semibold mb-4 text-center">
        Welcome to <br />
        <span className="text-2xl ">Pascal Planning Poker</span>
      </h1>
      <button
        type="button"
        className="bg-black text-white font-semibold py-2 px-4 rounded-lg w-full mb-4 hover:bg-gray-700 focus:outline-none"
        onClick={handleCreateBoard}
      >
        Create a board
      </button>
      <div className="text-center mb-0">or...</div>
      <hr className="mb-4" />
      <form onSubmit={handleJoinBoard} className="mb-4">
        <input
          type="text"
          name="boardCode"
          placeholder="Enter board code"
          className="py-2 px-4 border border-black rounded-lg w-full mb-4"
        />
        <button
          type="submit"
          className="bg-black text-white font-semibold py-2 px-4 rounded-lg w-full hover:bg-gray-700 focus:outline-none"
        >
          Join a board
        </button>
        {errorMessage && (
          <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
        )}
      </form>
    </div>
  );
};

export default HomePage;
