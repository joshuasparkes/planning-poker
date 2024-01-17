import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  getDocs,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase"; // Make sure this is the correct path to your firebase config

const DevBoardPage = () => {
  const { code } = useParams();
  const [epic, setEpic] = useState("");
  const [story, setStory] = useState("");
  const [task, setTask] = useState("");
  const [showModal, setShowModal] = useState(true); // State to control modal visibility
  const [userName, setUserName] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "boards"), where("code", "==", code));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        if (!querySnapshot.empty) {
          // Assuming 'code' is unique, there should only be one matching document.
          const data = querySnapshot.docs[0].data();
          setEpic(data.epic || "");
          setStory(data.story || "");
          setTask(data.task || "");
        } else {
          console.log("No such document!");
        }
      },
      (error) => {
        console.error("Error listening to board data: ", error);
      }
    );
    return () => unsubscribe();
  }, [code]);

  const handleNameSubmit = async () => {
    if (userName.trim() === "") {
      alert("Please enter your name.");
      return;
    }

    const q = query(collection(db, "boards"), where("code", "==", code));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const boardRef = querySnapshot.docs[0].ref;
      await updateDoc(boardRef, {
        participants: arrayUnion(userName),
      });
      setParticipantName(userName); // Update the participantName state
      setShowModal(false); // Hide the modal after submitting the name
    } else {
      console.error("No such document!");
    }
  };

  const handleCardClick = async (value) => {
    if (!participantName) {
      alert("Please enter your name.");
      return;
    }

    setSelectedValue(value); // Set the selected value

    const q = query(collection(db, "boards"), where("code", "==", code));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const boardRef = querySnapshot.docs[0].ref;
      await updateDoc(boardRef, {
        [`votes.${participantName}`]: value,
      });
      console.log(`Vote recorded: ${value}`);
    } else {
      console.error("No such document!");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Column */}
      <div className="flex-1 p-5 space-y-4">
        <h2 className="text-lg text-left font-semibold">{code}</h2>
        {participantName && (
          <h3 className="text-lg text-left mt-2">{participantName}</h3>
        )}
        <div className="bg-white p-4 border-2 rounded-lg">
          <h1 className="text-xl font-bold">Epic</h1>
          <div>{epic}</div> {/* Display the Epic content */}
        </div>
        <div className="bg-white p-4 border-2 rounded-lg">
          <h2 className="text-lg font-semibold">Story</h2>
          <div>{story}</div> {/* Display the Story content */}
        </div>
        <div className="bg-white p-4 border-2 rounded-lg">
          <h2 className="text-lg font-semibold">Task</h2>
          <div>{task}</div> {/* Display the Task content */}
        </div>
      </div>

      {/* Right Column */}
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="grid grid-cols-4 gap-4">
          {["1", "2", "3", "5", "8", "13", "20"].map((value) => (
            <div
              key={value}
              className={`bg-white p-4 shadow-lg rounded cursor-pointer hover:bg-blue-100 transform transition duration-300 ${
                selectedValue === value ? "border-4" : "border"
              }`}
              style={{
                borderColor: selectedValue === value ? "#333" : "#ddd",
                borderRadius: "8px",
                backgroundColor: "#fff",
                color: "#333",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
                aspectRatio: "1 / 1.4",
              }}
              onClick={() => handleCardClick(value)}
            >
              <div className="text-center text-xl font-semibold">{value}</div>
            </div>
          ))}
        </div>
      </div>
      {showModal && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          id="my-modal"
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Enter Your Name
              </h3>
              <div className="mt-2 px-7 py-3">
                <input
                  type="text"
                  className="px-3 py-2 border rounded text-gray-700 focus:outline-none focus:shadow-outline w-full"
                  placeholder="Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleNameSubmit();
                    }
                  }}
                />
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onClick={handleNameSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevBoardPage;
