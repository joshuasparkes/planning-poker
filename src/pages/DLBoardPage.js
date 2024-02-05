import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCopy,
  faEye,
  faQuestion,
  faRefresh,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const DLBoardPage = () => {
  const { code } = useParams();
  const [task, setTask] = useState("");
  const [story, setStory] = useState("");
  const [epic, setEpic] = useState("");
  const [participants, setParticipants] = useState([]);
  const [revealVotes, setRevealVotes] = useState(false);
  const [democraticVote, setDemocraticVote] = useState(null);
  const [buttonText, setButtonText] = useState("Save");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "messages"), where("boardId", "==", code));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newMessages = [];
      querySnapshot.forEach((doc) => {
        newMessages.push(doc.data());
      });
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [code]);

  const handleSave = async () => {
    // Create a query against the collection.
    const q = query(collection(db, "boards"), where("code", "==", code));

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // Assuming 'code' is unique, there should only be one matching document.
        const docRef = querySnapshot.docs[0].ref;

        await updateDoc(docRef, {
          epic: epic,
          story: story,
          task: task,
        });

        console.log("Board updated successfully");

        setButtonText("Saved!");
        setTimeout(() => {
          setButtonText("Save");
        }, 1000);
      } else {
        console.error("No document found with the code:", code);
      }
    } catch (error) {
      console.error("Error updating board: ", error);
    }
  };

  useEffect(() => {
    const q = query(collection(db, "boards"), where("code", "==", code));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          // Assuming docData.participants is an array of participant names
          // and docData.votes is an object with participant names as keys and votes as values
          const updatedParticipants = (docData.participants || []).map(
            (name) => ({
              name,
              vote: docData.votes ? docData.votes[name] : null,
            })
          );
          setParticipants(updatedParticipants);
        } else {
          console.error("No document found with the code:", code);
        }
      },
      (error) => {
        console.error("Error fetching board data: ", error);
      }
    );

    return () => unsubscribe();
  }, [code]);

  const copyToClipboard = () => {
    const devBoardUrl = `${window.location.origin}/devboard/${code}`;
    navigator.clipboard
      .writeText(devBoardUrl)
      .then(() => {
        console.log("URL copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const handleDeleteParticipant = async (participantToDelete) => {
    // Create a query against the collection.
    const q = query(collection(db, "boards"), where("code", "==", code));

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // Assuming 'code' is unique, there should only be one matching document.
        const docRef = querySnapshot.docs[0].ref;

        // Update the document to remove the participant.
        await updateDoc(docRef, {
          participants: arrayRemove(participantToDelete),
        });

        console.log("Participant deleted successfully");
      } else {
        console.error("No document found with the code:", code);
      }
    } catch (error) {
      console.error("Error deleting participant: ", error);
    }
  };

  const handleReveal = () => {
    setRevealVotes(true);

    const voteCounts = participants.reduce((acc, participant) => {
      if (participant.vote) {
        acc[participant.vote] = (acc[participant.vote] || 0) + 1;
      }
      return acc;
    }, {});

    const highestCount = Math.max(...Object.values(voteCounts));
    const mostCommonVotes = Object.keys(voteCounts).filter(
      (key) => voteCounts[key] === highestCount
    );

    if (mostCommonVotes.length > 1) {
      setDemocraticVote("It's a draw");
    } else {
      setDemocraticVote(mostCommonVotes[0] || null);
    }
  };

  const handleReset = async () => {
    setRevealVotes(false);
    setDemocraticVote(null);

    // Create a query against the collection.
    const q = query(collection(db, "boards"), where("code", "==", code));

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // Assuming 'code' is unique, there should only be one matching document.
        const docRef = querySnapshot.docs[0].ref;

        // Reset the votes for each participant.
        const updates = {
          votes: {}, // Reset the entire votes object
        };

        // Update the document to reset the votes.
        await updateDoc(docRef, updates);

        console.log("Votes reset successfully");
      } else {
        console.error("No document found with the code:", code);
      }
    } catch (error) {
      console.error("Error resetting votes: ", error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Header */}
      <div className="p-5 w-1/2 bg-slate-50 bg-white shadow">
        <div className="flex justify-between flex-col items-start">
          <h1 className="text-2xl font-bold">Board Code: {code}</h1>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={copyToClipboard}
          >
            Copy Dev Joining Link{" "}
            <FontAwesomeIcon className="ml-3" icon={faCopy} />
          </button>
        </div>
        {/* Left Column */}
        <div className="flex-1 p-5 space-y-0">
          <div className=" p-0 rounded-lg">
            <label htmlFor="epic" className="text-lg font-semibold block mb-0">
              Epic
            </label>
            <textarea
              id="epic"
              value={epic}
              onChange={(e) => setEpic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className=" p-0 rounded">
            <label htmlFor="story" className="text-lg font-semibold block mb-0">
              Story
            </label>
            <textarea
              id="story"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className=" p-0  rounded">
            <label htmlFor="task" className="text-lg font-semibold block mb-0">
              Task
            </label>
            <textarea
              id="task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleSave}
          >
            {buttonText} <FontAwesomeIcon className="ml-3" icon={faSave} />
          </button>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex-1 p-5 space-y-2">
        <div className=" p-2 rounded">
          <div className="flex justify-end mb-2 space-x-2">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={handleReveal}
            >
              Reveal <FontAwesomeIcon className="ml-3" icon={faEye} />
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
              onClick={handleReset}
            >
              Reset <FontAwesomeIcon className="ml-3" icon={faRefresh} />
            </button>
          </div>
          <table className="w-full bg-white">
            <thead>
              <tr>
                <th className="border-b-2 border-gray-300 px-4 text-center">
                  Engineer
                </th>
                <th className="border-b-2 border-gray-300 p-4 text-center">
                  Vote
                </th>
                <th className="border-b-2 border-gray-300 p-4 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => (
                <tr key={participant.name}>
                  <td className="border-b border-gray-300 px-4">
                    {participant.name}
                  </td>
                  <td className="border-b border-gray-300 px-4 text-center">
                    {revealVotes ? (
                      participant.vote
                    ) : participant.vote ? (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-green-500"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faQuestion}
                        className="text-gray-500"
                      />
                    )}
                  </td>
                  <td className="border-b border-gray-300 px-4">
                    <button
                      className=" text-red-500 p-2 rounded hover:text-red-700"
                      onClick={() => handleDeleteParticipant(participant.name)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {revealVotes && (
          <div className="mt-4 border bg-white p-2 rounded-lg">
            <span className="font-bold  text-lg">
              Democratic Vote: {democraticVote}
            </span>
          </div>
        )}
        <div
          className="mt-auto p-2 bg-slate-800 border rounded-lg"
          style={{ maxHeight: "45%", overflowY: "auto" }}
        >
          <div className="text-lg text-white font-bold">Feed</div>
          <ul>
            {messages.map((message, index) => (
              <li
                className="border w-fit bg-slate-50 rounded-lg mx-3 my-1 text-left p-2"
                key={index}
              >
                {message.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DLBoardPage;
