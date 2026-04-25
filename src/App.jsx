import BuildTable from './components/BuildTable.jsx'

const dataset = {
  columns: [
    { 
      key: "title", 
      label: "Title", 
      sortable: true, 
      width: "120px", 
      align: "center" 
    },
    { 
      key: "firstName", 
      label: "First Name", 
      sortable: true 
    },
    { 
      key: "lastName", 
      label: "Last Name", 
      sortable: true 
    }
  ],
  rows: [
    ["Mr", "Bob", "Smith"],
    ["Mr", "Rick", "Big"],
    ["Mrs", "Alice", "Wonder"]
  ],
  globalFilter: "",
  sortConfig: { 
    key: "lastName", 
    direction: "asc" 
  }
}

function App() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <BuildTable dataset={dataset} />
    </div>
  )
}

export default App
