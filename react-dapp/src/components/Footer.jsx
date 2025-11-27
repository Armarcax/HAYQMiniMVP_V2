// src/components/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="socials">
        <a href="https://www.youtube.com/" target="_blank" rel="noreferrer">
          <img src="/youtube.svg" alt="YouTube" />
        </a>
        <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer">
          <img src="/tiktok.svg" alt="TikTok" />
        </a>
        <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
          <img src="/instagram.svg" alt="Instagram" />
        </a>
        <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
          <img src="/facebook.svg" alt="Facebook" />
        </a>
        <a href="https://twitter.com/" target="_blank" rel="noreferrer">
          <img src="/twitter.svg" alt="Twitter" />
        </a>
      </div>
      <div className="youtube-embed">
        <iframe
          width="100%"
          height="300"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="YouTube video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <p style={{ textAlign: "center", marginTop: 10 }}>© 2025 HAYQ Token</p>
    </footer>
  );
}
