import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import InsertionSortMasterclass from "./InsertionSortMasterclass";
import BubbleSortMasterclass from "./BubbleSortMasterclass";
import SelectionSortMasterclass from "./SelectionSortMasterclass";
import MergeSortMasterclass from "./MergeSortMasterclass";
import QuickSortMasterclass from "./QuickSortMasterclass";
import BinarySearchMasterclass from "./BinarySearchMasterclass";
import TwoPointersMasterclass from "./TwoPointersMasterclass";// temporary placeholders (we’ll create real ones next)
function Placeholder({ name }) {
  return (
    <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>
      <h1>{name}</h1>
      <p>Coming soon...</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/insertion" element={<InsertionSortMasterclass />} />


<Route path="/bubble" element={<BubbleSortMasterclass />} />
<Route path="/selection" element={<SelectionSortMasterclass />} />
<Route path="/merge" element={<MergeSortMasterclass />} />
<Route path="/quick" element={<QuickSortMasterclass />} /> 
<Route path="/binary" element={<BinarySearchMasterclass />} />
<Route path="/two-pointers" element={<TwoPointersMasterclass />} />
   </Routes>
  );
}