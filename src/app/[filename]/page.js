"use client";

import axios from "axios";
import ResultVideo from "@/components/ResultVideo";
import TranscriptionEditor from "@/components/TranscriptionEditor";
import { useEffect, useState } from "react";
import { clearTranscriptionItems } from "@/libs/awsTranscriptionHelpers";

export default function FilePage({ params }) {
  const filename = params.filename;
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [awsTranscriptionItems, setAwsTranscriptionItems] = useState([]);

  useEffect(() => {
    getTranscription();
  }, [filename]);

  function getTranscription() {
    setIsFetchingInfo(true);
    axios
      .get("/api/transcribe?filename=" + filename)
      .then((response) => {
        setIsFetchingInfo(false);
        const status = response.data?.status;
        const transcription = response.data?.transcription;

        if (status === "IN_PROGRESS") {
          setIsTranscribing(true);
          setTimeout(getTranscription, 3000);
        } else {
          setIsTranscribing(false);

          if (transcription?.results?.items) {
            console.log("Transcription results:", transcription.results.items);
            setAwsTranscriptionItems(
              clearTranscriptionItems(transcription.results.items)
            );
          } else {
            console.error(
              "Transcription results are undefined or not in the expected format.",
              transcription
            );
            // Handle the case when transcription is not as expected
            setAwsTranscriptionItems([]);
          }
        }
      })
      .catch((error) => {
        setIsFetchingInfo(false);
        setIsTranscribing(false);
        console.error("Error fetching transcription:", error);
        // Handle the error accordingly
      });
  }

  if (isTranscribing) {
    return <div>Transcribing your video...</div>;
  }

  if (isFetchingInfo) {
    return <div>Fetching transcription...</div>;
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-8 sm:gap-16">
        <div className="">
          <h2 className="text-2xl mb-4 text-white/60">Transcription</h2>
          <TranscriptionEditor
            awsTranscriptionItems={awsTranscriptionItems}
            setAwsTranscriptionItems={setAwsTranscriptionItems}
          />
        </div>
        <div>
          <h2 className="text-2xl mb-4 text-white/60">Result</h2>
          <ResultVideo
            filename={filename}
            transcriptionItems={awsTranscriptionItems}
          />
        </div>
      </div>
    </div>
  );
}
