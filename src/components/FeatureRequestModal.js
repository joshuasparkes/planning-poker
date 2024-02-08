import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsDown,
  faThumbsUp,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const FeatureRequestModal = ({ showModal, setShowModal }) => {
  const [featureName, setFeatureName] = useState("");
  const [features, setFeatures] = useState([]);
  const [votedFeatures, setVotedFeatures] = useState(new Set()); // Tracks features the user has voted on

  useEffect(() => {
    const fetchFeatures = async () => {
      const querySnapshot = await getDocs(collection(db, "features"));
      const featuresData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeatures(featuresData);
    };

    fetchFeatures();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (featureName.trim() === "") return;

    const docRef = await addDoc(collection(db, "features"), {
      name: featureName,
      votes: 0,
    });
    setFeatures([...features, { id: docRef.id, name: featureName, votes: 0 }]);
    setFeatureName("");
  };

  const handleVote = async (id, delta) => {
    if (votedFeatures.has(id)) {
      alert("You've already voted on this feature.");
      return;
    }

    const feature = features.find((f) => f.id === id);
    const newVotes = feature.votes + delta;
    await updateDoc(doc(db, "features", id), { votes: newVotes });

    const updatedFeatures = features.map((f) =>
      f.id === id ? { ...f, votes: newVotes } : f
    );
    setFeatures(updatedFeatures);

    setVotedFeatures(new Set([...votedFeatures, id])); // Add the feature to the set of voted features
  };

  if (!showModal) return null;

  // Sort features by number of votes in descending order
  const sortedFeatures = features.slice().sort((a, b) => b.votes - a.votes);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="relative w-7/12 h-5/6 bg-white p-5 rounded shadow-lg">
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-0 right-0 m-4"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h2 className="text-lg mb-4">Request a Feature</h2>
        <form className="w-full" onSubmit={handleSubmit}>
          <input
            type="text"
            value={featureName}
            onChange={(e) => setFeatureName(e.target.value)}
            placeholder="Enter a feature suggestion"
            className="border border-black rounded-lg w-3/4 p-2 mr-2"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Submit
          </button>
        </form>
        <h2 className="text-lg mt-4">Vote for Features</h2>

        <div className="flex-grow flex items-center justify-center">
          <ul className=" w-full">
            {sortedFeatures.map((feature) => (
              <li
                key={feature.id}
                className="mt-2 flex justify-between items-center border w-3/4 p-2 rounded-lg mx-auto"
              >
                <span className="text-left">{feature.name}</span>
                <div>
                <span className="bg-slate-600 text-white rounded-full px-3 py-2 font-bold">{feature.votes}</span>
                  <button
                    disabled={votedFeatures.has(feature.id)}
                    onClick={() => handleVote(feature.id, 1)}
                    className="ml-2 border border-black   rounded-full px-2 py-1"
                  >
                    <FontAwesomeIcon
                      className="text-green-700 hover:text-green-300"
                      icon={faThumbsUp}
                    />
                  </button>
                  <button
                    disabled={votedFeatures.has(feature.id)}
                    onClick={() => handleVote(feature.id, -1)}
                    className="ml-2 border border-black   rounded-full px-2 py-1"
                  >
                    <FontAwesomeIcon
                      className="text-red-700 hover:text-red-300"
                      icon={faThumbsDown}
                    />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FeatureRequestModal;
