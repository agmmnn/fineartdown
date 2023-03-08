import { useState } from "preact/hooks";
import "./app.css";

export function App() {
  const [num1, setNum1] = useState<number>(486);
  const [num2, setNum2] = useState<number>(540);
  const [num3, setNum3] = useState<number>(600);

  const power = 90;
  const numPower = (size) => size / power;
  const [{ width, height }, setWH] = useState<{
    width: number;
    height: number;
  }>({ width: 5120, height: 3382 });
  const [ratio, setRatio] = useState<number>(width / height);
  const [keepRatio, setKeepRatio] = useState(false);

  const handleWHChange = (event) => {
    const { name, value } = event.target;
    if (keepRatio) {
      const newValue = name === "width" ? value : Math.round(value / ratio);
      const otherName = name === "width" ? "height" : "width";
      const otherValue =
        width === height ? newValue : Math.round(value * ratio);
      setWH({
        [name]: parseInt(value),
        [otherName]: parseInt(otherValue),
      });
    } else {
      setWH((prevWH) => ({ ...prevWH, [name]: Math.round(value) }));
    }
    if (!keepRatio) {
      setRatio((prevRatio) => (name === "width" ? prevRatio : width / value));
    }
  };

  const handleKeepRatioChange = () => {
    setKeepRatio(!keepRatio);
  };

  const handle = (event) => {
    const value = parseInt(event.target.value) || 0;
    const id = event.target.id;
    if (id === "num1") {
      setNum1(value);
      setNum2(value / 0.9);
      setNum3(value / 0.9 / 0.9);
    } else if (id === "num2") {
      setNum1(value * 0.9);
      setNum2(value);
      setNum3(value / 0.9);
    } else {
      setNum1(value * 0.9 * 0.9);
      setNum2(value * 0.9);
      setNum3(value);
    }
  };

  const urlParams = (widthMedium: number, heightMedium: number) =>
    new URLSearchParams({
      // artworkid: "00000",
      widthmedium: String(widthMedium),
      heightmedium: String(heightMedium),
      // x: "0",
      // y: "0",
    });

  return (
    <>
      <div className="card">
        <h3>
          <p>
            backend: [{num1 / 0.9}, {num2 / 0.9}, {num3 / 0.9}]<br />
            backend resize: [{num1 / 0.9 - (num1 / 0.9) * 0.1},{" "}
            {num2 / 0.9 - (num2 / 0.9) * 0.1}, {num3 / 0.9 - (num3 / 0.9) * 0.1}
            ]<br />
            backend resize rounded: [
            {Math.round(num1 / 0.9 - (num1 / 0.9) * 0.1)},{" "}
            {Math.round(num2 / 0.9 - (num2 / 0.9) * 0.1)},{" "}
            {Math.round(num3 / 0.9 - (num3 / 0.9) * 0.1)}]
          </p>
          <p>
            gap: [{num1 / 0.9 - num1}, {num2 / 0.9 - num2}, {num3 / 0.9 - num3}]
            <br />
            gap rounded: [{Math.round(num1 / 0.9 - num1)},{" "}
            {Math.round(num2 / 0.9 - num2)}, {Math.round(num3 / 0.9 - num3)}]
          </p>
          <p>
            actual:[{num1}, {num2}, {num3}]
          </p>
        </h3>
        <input id="num1" onInput={handle} value={num1} type="number"></input>
        <input id="num2" onInput={handle} value={num2} type="number"></input>
        <input id="num3" onInput={handle} value={num3} type="number"></input>
      </div>
      <div className="card">
        <h3>
          <p>
            {num1}: widthMedium: {width / numPower(num1)}, heightMedium:
            {height / numPower(num1)}
            <h6 style={{ margin: 0, color: "grey" }}>
              {urlParams(
                width / numPower(num1),
                height / numPower(num1)
              ).toString()}
              <br />
              {width / numPower(num1) / (height / numPower(num1))}
            </h6>
          </p>
          <p>
            {num2}: widthMedium: {width / numPower(num2)}, heightMedium:
            {height / numPower(num2)}
            <h6 style={{ margin: 0, color: "grey" }}>
              {urlParams(
                width / numPower(num2),
                height / numPower(num2)
              ).toString()}
              <br />
              {width / numPower(num2) / (height / numPower(num2))}
            </h6>
          </p>
          <p>
            {num3}: widthMedium: {width / numPower(num3)}, heightMedium:{" "}
            {height / numPower(num3)}
            <h6 style={{ margin: 0, color: "grey" }}>
              {urlParams(
                width / numPower(num3),
                height / numPower(num3)
              ).toString()}
              <br />
              {width / numPower(num3) / (height / numPower(num3))}
            </h6>
          </p>
        </h3>
        <input
          // type="number"
          name="width"
          value={width}
          onInput={handleWHChange}
          style={{ width: 100 }}
        />
        <input
          // type="number"
          name="height"
          value={height}
          onInput={handleWHChange}
          style={{ width: 100 }}
        />
      </div>
      <label>
        <input
          type="checkbox"
          checked={keepRatio}
          onChange={handleKeepRatioChange}
          style={{
            width: "1em",
            height: "1em",
            borderRadius: "0.15em",
            marginRight: "0.5em",
            border: "0.15em solid #007a7e",
            outline: "none",
            cursor: "pointer",
            textAlign: "center",
          }}
        />
        Keep Ratio ({ratio})
      </label>
    </>
  );
}
