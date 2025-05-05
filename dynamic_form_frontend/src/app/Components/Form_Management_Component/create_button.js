
// const CreateButton = ({ onCreateFormClick }) => (
//   <>
//     <button
//       onClick={onCreateFormClick}
//       className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
//     >
//       Create New Form
//     </button>
//     <button className="ml-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
//       Create New Category
//     </button>
//   </>
// );

// export default CreateButton;
const CreateButton = ({ onCreateFormClick, onCreateCategoryClick }) => (
  <>
    <button
      onClick={onCreateFormClick}
      className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
    >
      Create New Form
    </button>
    <button
      onClick={onCreateCategoryClick}
      className="ml-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
    >
      Create New Category
    </button>
  </>
);

export default CreateButton;
