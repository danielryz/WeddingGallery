
// src/Home.tsx – komponent strony głównej z wrapperem tła
import React from "react";
import styles from "./HomePage.module.css";

const HomePage: React.FC = () => {
  return (
      <div className={styles.homePageWrapper}>
        <h1>Moja aplikacja</h1>
        <p>Treść strony głównej...</p>
      </div>
  );
};

export default HomePage;
