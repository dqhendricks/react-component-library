import { SelectSearchable } from './components/SelectSearchable'

function App() {

  return (
    <>
      <h1>Component Library</h1>
      <div>
        <p>SelectSearchable</p>
        <SelectSearchable.Root style={{maxWidth: '175px'}} onValueChange={(val) => console.log(val)}>
          <SelectSearchable.Trigger placeholder='Choose...' />
          <SelectSearchable.Dropdown>
            <SelectSearchable.Search />
            <SelectSearchable.Option value='1'>abcde</SelectSearchable.Option>
            <SelectSearchable.Option value='2'>abccc</SelectSearchable.Option>
            <SelectSearchable.Option value='3'>aaaaa</SelectSearchable.Option>
          </SelectSearchable.Dropdown>
        </SelectSearchable.Root>
      </div>
    </>
  )
}

export default App
