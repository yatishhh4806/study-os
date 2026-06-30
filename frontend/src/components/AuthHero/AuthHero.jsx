import Lanyard from "../Lanyard/lanyard";
import logo from "/logo.png";


function AuthHero() {
  return (
    <div className="relative flex h-165 w-full items-center justify-center overflow-visible z-20">
      <Lanyard 
      position={[0, 0, 20]} 
      gravity={[0, -40, 0]}
      frontImage={logo}
      />
    </div>
  );
}

export default AuthHero;
