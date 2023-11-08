import { useState } from "react";
import ShareModal from "./ShareModal";
const mimeType = 'video/webm; codecs="opus,vp8"';

const Share = ({ label, text, title, files }) => {
  const [showModal, setShowModal] = useState(false);
  console.log({ "===": files });
  // const files = new File([files], "recoded.mp4", {
  //   type: mimeType,
  // });
  // console.log({ files });

  const canonical = document.querySelector("link[rel=canonical]");
  let url = canonical ? canonical.href : document.location.href;
  const shareDetails = { files, title, text };

  const handleSharing = async () => {
    if (navigator.share) {
      try {
        await navigator
          .share(shareDetails)
          .then(() =>
            console.log("Hooray! Your content was shared to tha world")
          );
      } catch (error) {
        console.log(`Oops! I couldn't share to the world because: ${error}`);
      }
    } else {
      // fallback code
      setShowModal(true); //this is the line added in this snippet

      console.log(
        "Web share is currently not supported on this browser. Please provide a callback"
      );
    }
  };
  return (
    <>
      <button className="sharer-button" onClick={handleSharing}>
        <span className="sharer-button-text">{label}</span>
      </button>

      <ShareModal
        handleClose={setShowModal}
        shareData={shareDetails}
        modalVisible={showModal}
      />
    </>
  );
};

export default Share;
