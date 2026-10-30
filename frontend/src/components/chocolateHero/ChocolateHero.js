import React from "react";

import "./ChocolateHero.css";

function ChocolateHero() {
  return (
    <div className="chocolate-display">

      {/* Floating chocolates */}

      <div className="floating-chocolate fc-1">
        🍫
      </div>

      <div className="floating-chocolate fc-2">
        🍫
      </div>

      <div className="floating-chocolate fc-3">
        🍫
      </div>

      <div className="floating-chocolate fc-4">
        🍫
      </div>

      <div className="floating-chocolate fc-5">
        🍫
      </div>


      {/* Chocolate splash */}

      <div className="chocolate-splash"></div>


      {/* =================================
          CHOCOLATE PACKETS
      ================================= */}

      <div className="chocolate-packets">

        {/* KITKAT 1 */}

        <div className="choco-packet kitkat kk-1">
          <div className="kitkat-logo">
            KitKat
          </div>

          <div className="kitkat-line">
            HAVE A BREAK
          </div>

          <div className="kitkat-chocolate">
            ▰ ▰
          </div>
        </div>


        {/* KITKAT 2 */}

        <div className="choco-packet kitkat kk-2">
          <div className="kitkat-logo">
            KitKat
          </div>

          <div className="kitkat-line">
            HAVE A BREAK
          </div>

          <div className="kitkat-chocolate">
            ▰ ▰
          </div>
        </div>


        {/* KITKAT 3 */}

        <div className="choco-packet kitkat kk-3">
          <div className="kitkat-logo">
            KitKat
          </div>

          <div className="kitkat-line">
            HAVE A BREAK
          </div>

          <div className="kitkat-chocolate">
            ▰ ▰
          </div>
        </div>


        {/* KITKAT 4 */}

        <div className="choco-packet kitkat kk-4">
          <div className="kitkat-logo">
            KitKat
          </div>

          <div className="kitkat-line">
            HAVE A BREAK
          </div>

          <div className="kitkat-chocolate">
            ▰ ▰
          </div>
        </div>


        {/* DAIRY MILK */}

        <div className="choco-packet dairy">
          <div className="dairy-small">
            Cadbury
          </div>

          <div className="dairy-big">
            DAIRY
          </div>

          <div className="dairy-big">
            MILK
          </div>

          <div className="dairy-small">
            Chocolate
          </div>
        </div>


        {/* OREO */}

        <div className="choco-packet oreo">
          <div className="oreo-logo">
            OREO
          </div>

          <div className="oreo-original">
            Original
          </div>

          <div className="oreo-small">
            Chocolate
          </div>
        </div>


        {/* 5 STAR */}

        <div className="choco-packet star">
          <div className="star-small">
            5 STAR
          </div>

          <div className="star-big">
            CARAMEL
          </div>

          <div className="star-small">
            Chocolate
          </div>
        </div>

      </div>


      {/* =================================
          RK CHOCO BOX
      ================================= */}

      <div className="rk-choco-box">

        <div className="box-star">
          ✦
        </div>

        <div className="box-title">
          RK CHOCO
        </div>

        <div className="box-subtitle">
          DISTRIBUTORS
        </div>

        <div className="box-bottom">
          PREMIUM QUALITY
          &nbsp;&nbsp;&nbsp;
          CHOCOLATES
        </div>

      </div>


      {/* Chocolate pieces */}

      <div className="chocolate-piece cp-1">
        🍫
      </div>

      <div className="chocolate-piece cp-2">
        🍫
      </div>

      <div className="chocolate-piece cp-3">
        🍫
      </div>

    </div>
  );
}

export default ChocolateHero;