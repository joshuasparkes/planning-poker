import React from "react";
import { useNavigate } from "react-router-dom";
import { db, serverTimestamp, collection, addDoc } from '../firebase'; // Import the necessary functions

const HomePage = () => {
  const navigate = useNavigate();

  const handleCreateBoard = async () => {
    const boardCode = Math.random().toString(36).substring(2, 8);
    try {
      const boardRef = await addDoc(collection(db, 'boards'), {
        code: boardCode,
        createdAt: serverTimestamp(),
      });
      console.log('Board created with ID:', boardRef.id);
      navigate(`/board/${boardCode}`);
    } catch (error) {
      console.error("Error creating new board: ", error);
    }
  };

  const handleJoinBoard = (event) => {
    event.preventDefault();
    const boardCode = event.target.elements.boardCode.value;
    navigate(`/devboard/${boardCode}`); // Updated to navigate to the DevBoardPage with the board code
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
        <h1 className="text-3xl font-bold mb-4 text-center">
          Welcome to Pascal Planning Poker
        </h1>
        <button
          type="button" // Explicitly specify the button type
          className="bg-black text-white font-semibold py-2 px-4 rounded-lg w-full mb-4 hover:bg-gray-700 focus:outline-none"
          onClick={handleCreateBoard}
        >
          Create a board
        </button>
        <div className="text-center mb-4">or...</div>
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
        </form>
    </div>
  );
};

export default HomePage;
