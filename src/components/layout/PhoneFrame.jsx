import './PhoneFrame.css';

export default function PhoneFrame({ children }) {
  return (
    <div className="frame-outer">
      <div className="frame-bezel">
        <div className="frame-notch" />
        <div className="frame-screen">
          {children}
        </div>
        <div className="frame-home-bar" />
      </div>
    </div>
  );
}
