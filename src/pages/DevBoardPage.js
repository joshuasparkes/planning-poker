import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  getDocs,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase";
import reubenImage from "../images/reuben.png";
import aramImage from "../images/aram.png"; // Import aram.png
import joshImage from "../images/josh.png"; // Import josh.png
import jorgeImage from "../images/jorge.png"; // Import josh.png
import justinImage from "../images/justin.png"; // Import josh.png
import jeremyImage from "../images/jeremy.png"; // Import josh.png
import nickImage from "../images/nick.jpg"; // Import josh.png
import {
  faBug,
  faChevronRight,
  faPaperPlane,
  faVoteYea,
} from "@fortawesome/free-solid-svg-icons";
import FeatureRequestModal from "../components/FeatureRequestModal"; // Adjust the path as necessary

const DevBoardPage = () => {
  const { code } = useParams();
  const [epic, setEpic] = useState("");
  const [story, setStory] = useState("");
  const [task, setTask] = useState("");
  const [showModal, setShowModal] = useState(true); // State to control modal visibility
  const [userName, setUserName] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const sendMessage = async (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    if (message.trim() === "") return; // Ignore empty messages

    await addDoc(collection(db, "messages"), {
      boardId: code,
      message: message,
      readStatus: false,
    });

    setMessage(""); // Clear the input field after sending
  };

  const valueToImageMap = {
    1: reubenImage,
    2: jorgeImage,
    3: nickImage,
    5: jeremyImage,
    8: justinImage,
    13: aramImage,
    20: joshImage,
  };

  useEffect(() => {
    const q = query(collection(db, "boards"), where("code", "==", code));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setEpic(data.epic || "");
          setStory(data.story || "");
          setTask(data.task || "");
          // Reset selectedValue if the votes have been reset
          if (data.votes && !data.votes[participantName]) {
            setSelectedValue(null);
          }
        } else {
          console.log("No such document!");
        }
      },
      (error) => {
        console.error("Error listening to board data: ", error);
      }
    );
    return () => unsubscribe();
  }, [code, participantName]);

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

    const imageKeys = Object.keys(valueToImageMap);
    const randomKey = imageKeys[Math.floor(Math.random() * imageKeys.length)];
    const randomImage = valueToImageMap[randomKey];

    setSelectedImage(randomImage);

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
      <div className="flex-1 p-5">
        {participantName && (
          <div className="text-4xl text-left">Welcome, {participantName}.</div>
        )}
        <div className="text-sm text-gray text-left font-light">
          Board: {code}
        </div>
        <div className="text-left mt-2 bg-slate-800 text-white font-bold border rounded-lg p-2">
          {" "}
          <span>
            Click a card to vote on the complexity of the task being discussed{" "}
            <FontAwesomeIcon className="ml-2" icon={faChevronRight} />
          </span>{" "}
          <span className="text-sm font-normal">
            If unsure, let the team know!
          </span>
        </div>
        <div className="relative bg-white p-4 border-2 rounded-lg mt-8">
          <h2 className="absolute top-[-1rem] left-2 bg-white px-2 text-lg font-semibold">
            Outcome
          </h2>
          <div>{epic}</div> {/* Display the Epic content */}
        </div>
        <div className="relative bg-white p-4 border-2 rounded-lg mt-8">
          <h2 className="absolute top-[-1rem] left-2 bg-white px-2 text-lg font-semibold">
            Epic
          </h2>
          <div>{story}</div> {/* Display the Story content */}
        </div>
        <div className="relative bg-white p-4 border-2 rounded-lg mt-8">
          <h2 className="absolute top-[-1rem] left-2 bg-white px-2 text-lg font-semibold">
            Issue
          </h2>
          <div>{task}</div> {/* Display the Task content */}
        </div>
      </div>

      {/* Right Column */}
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="grid grid-cols-4 gap-4">
          {["1", "2", "3", "5", "8", "13", "20"].map((value) => (
            <div
              key={value}
              className={`bg-white hover:border-2 p-4 shadow-lg rounded cursor-pointer hover:bg-blue-100 transform transition duration-300 ${
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
              {selectedValue === value && selectedImage ? (
                <>
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="max-h-full"
                  />
                  <div className="text-center text-xl font-semibold">
                    Voted!
                  </div>
                </>
              ) : (
                <div className="text-center text-xl font-semibold">{value}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute top-0 right-0 p-4 flex items-start">
        <form onSubmit={sendMessage} className="flex justify-between mr-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 mr-4 p-2 border-2 rounded-lg h-10" // Added h-10 for consistent height
          />
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded h-10" // Added h-10 for consistent height
          >
            Post to Feed{" "}
            <FontAwesomeIcon className="ml-4" icon={faPaperPlane} />
          </button>
        </form>
        <a
          href="mailto:reuben.t@snowfalltravel.com?subject=Please please help me Reuben"
          className="bg-red-500 mr-4 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-l h-10" // Added h-10 for consistent height
          style={{ textDecoration: "none" }}
        >
          Report a Bug
          <FontAwesomeIcon className="ml-4" icon={faBug} />
        </a>
        <button
          onClick={() => setShowFeatureModal(true)}
          className="bg-blue-500 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-r h-10" // Added h-10 for consistent height
        >
          Request a Feature
          <FontAwesomeIcon className="ml-4" icon={faVoteYea} />
        </button>
      </div>

      <FeatureRequestModal
        showModal={showFeatureModal}
        setShowModal={setShowFeatureModal}
      />
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
