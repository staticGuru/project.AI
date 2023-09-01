import { useNavigate } from "react-router-dom";
import "../style/styles.css";
import { useEffect } from "react";

export function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    const video = document.querySelector("video");

    video.onended = (event) => {
      navigate("/chat");
    };
  }, []);
  return (
    <section className="relative h-screen flex flex-col items-center justify-center text-center text-white py-0 px-3">
      <div className="video-docker absolute top-0 left-0 w-full h-full overflow-hidden">
        <video
          className="min-w-full min-h-full absolute object-cover"
          src="https://cdn.pixabay.com/vimeo/775376205/cyborg-140521.mp4?width=640&hash=a7e9d97369377dca13a0ed4b78d9b4eda8a9832b"
          type="video/mp4"
          autoPlay
          muted
          id="videoContainer"
        ></video>
      </div>
      <div className="flex z-10 absolute top-0 mt-10">
        <img
          src={require("../assets/logo.png")}
          alt="logo"
          style={{ width: "100px", height: "100px" }}
        />
      </div>
      <div className="video-content space-y-2 w-1/4 items-end text-left">
        <h1 className="font-bold text-2xl">Lorem Ipsum Dolor Sit Amet</h1>
        <h3 className="font-normal text-sm">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur
        </h3>
      </div>
      <div
        className="flex z-10 absolute bottom-0 mb-10 right-10 cursor-pointer"
        onClick={() => navigate("/chat")}
      >
        <h1 className="font-medium text-xl text-blue-600">skip -{">"}</h1>
      </div>
    </section>
  );
}
