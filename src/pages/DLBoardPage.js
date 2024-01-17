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
  faCopy,
  faEye,
  faRefresh,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const DLBoardPage = () => {
  const { code } = useParams();
  const [developers, setDevelopers] = useState(() => {
    const savedDevelopers = localStorage.getItem(`developers_${code}`);
    return savedDevelopers ? JSON.parse(savedDevelopers) : [];
  });
  const [votes, setVotes] = useState(() => {
    const savedVotes = localStorage.getItem(`votes_${code}`);
    return savedVotes ? JSON.parse(savedVotes) : {};
  });
  const [task, setTask] = useState("");
  const [story, setStory] = useState("");
  const [epic, setEpic] = useState("");
  const [participants, setParticipants] = useState([]);
  const [revealVotes, setRevealVotes] = useState(false);
  const [democraticVote, setDemocraticVote] = useState(null);

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
          const updatedParticipants = docData.participants.map((name) => ({
            name,
            vote: docData.votes ? docData.votes[name] : null,
          }));
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

  useEffect(() => {
    localStorage.setItem(`developers_${code}`, JSON.stringify(developers));
    localStorage.setItem(`votes_${code}`, JSON.stringify(votes));
  }, [developers, votes, code]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === `votes_${code}`) {
        setVotes(JSON.parse(e.newValue) || {});
      }
      if (e.key === `epic_${code}`) {
        setEpic(e.newValue || "");
      }
      if (e.key === `story_${code}`) {
        setStory(e.newValue || "");
      }
      if (e.key === `task_${code}`) {
        setTask(e.newValue || "");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [code]); // Only re-run the effect if the code changes

  const handleReveal = () => {
    setRevealVotes(true);
  
    // Calculate the vote counts
    const voteCounts = participants.reduce((acc, participant) => {
      if (participant.vote) {
        acc[participant.vote] = (acc[participant.vote] || 0) + 1;
      }
      return acc;
    }, {});
  
    // Find the highest vote count
    const highestCount = Math.max(...Object.values(voteCounts));
    // Filter the votes that have the highest count
    const mostCommonVotes = Object.keys(voteCounts).filter((key) => voteCounts[key] === highestCount);
  
    // Check if there is a draw
    if (mostCommonVotes.length > 1) {
      setDemocraticVote("It's a draw");
    } else {
      // Set the most common vote
      setDemocraticVote(mostCommonVotes[0] || null);
    }
  };

  const handleReset = () => {
    setRevealVotes(false);
    setDemocraticVote(null);
  };

  return (
    <div className="flex h-screen">
      {/* Header */}
      <div className="p-5 w-1/2 bg-white shadow">
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
        <div className="flex-1 p-5 space-y-4">
          <div className="bg-white p-4 rounded">
            <label htmlFor="epic" className="text-lg font-semibold block mb-2">
              Epic
            </label>
            <textarea
              id="epic"
              value={epic}
              onChange={(e) => setEpic(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="bg-white p-4 rounded">
            <label htmlFor="story" className="text-lg font-semibold block mb-2">
              Story
            </label>
            <textarea
              id="story"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="bg-white p-4  rounded">
            <label htmlFor="task" className="text-lg font-semibold block mb-2">
              Task
            </label>
            <textarea
              id="task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleSave}
          >
            Save <FontAwesomeIcon className="ml-3" icon={faSave} />
          </button>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex-1 p-5 space-y-4">
        <div className="bg-white p-4 shadow rounded">
          <table className="w-full">
            <thead>
              <tr>
                <th className="border-b-2 border-gray-300 p-4 text-center">
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
                  <td className="border-b border-gray-300 p-4">
                    {participant.name}
                  </td>
                  <td className="border-b border-gray-300 p-4">
                    {revealVotes ? participant.vote : "?"}
                  </td>
                  <td className="border-b border-gray-300 p-4">
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
        <div className="flex justify-end space-x-2">
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
        {revealVotes && (
          <div className="mt-4 border-2 p-6 rounded-lg">
            <span className="font-bold text-2xl">Democratic Vote: {democraticVote}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DLBoardPage;
