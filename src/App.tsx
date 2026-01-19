import { SelectSearchable } from './components/SelectSearchable'

function App() {

  return (
    <>
      <h1>Component Library</h1>
      <div>
        <p>SelectSearchable</p>
        <SelectSearchable.Root style={{ maxWidth: 200 }} onValueChange={(val) => console.log(val)}>
          <SelectSearchable.Trigger>
            <SelectSearchable.TriggerValue
              placeholder="Choose..."
            />

            {/* Custom chevron (no libs) */}
            <span
              aria-hidden="true"
              style={{
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "6px solid currentColor",
                opacity: 0.85,
                flex: "0 0 auto",
              }}
            />
          </SelectSearchable.Trigger>

          <SelectSearchable.Dropdown>
            <SelectSearchable.Search placeholder="Search…" />

            <SelectSearchable.OptionList>
              <SelectSearchable.Option value="1">Alice Johnson</SelectSearchable.Option>
              <SelectSearchable.Option value="2">Benjamin Wright</SelectSearchable.Option>
              <SelectSearchable.Option value="3">Charlotte Nguyen</SelectSearchable.Option>
              <SelectSearchable.Option value="4">Daniel Alvarez</SelectSearchable.Option>
              <SelectSearchable.Option value="5">Emily Thompson</SelectSearchable.Option>
              <SelectSearchable.Option value="6">Frederick Moore</SelectSearchable.Option>
              <SelectSearchable.Option value="7">Grace Kim</SelectSearchable.Option>
              <SelectSearchable.Option value="8">Henry Patel</SelectSearchable.Option>
              <SelectSearchable.Option value="9">Isabella Rossi</SelectSearchable.Option>
              <SelectSearchable.Option value="10">James Anderson</SelectSearchable.Option>
              <SelectSearchable.Option value="11">Katherine Lee</SelectSearchable.Option>
              <SelectSearchable.Option value="12">Liam O’Connor</SelectSearchable.Option>
              <SelectSearchable.Option value="13">Maya Fernandez</SelectSearchable.Option>
              <SelectSearchable.Option value="14">Noah Stein</SelectSearchable.Option>
              <SelectSearchable.Option value="15">Olivia Brooks</SelectSearchable.Option>
              <SelectSearchable.Option value="16">Patrick Doyle</SelectSearchable.Option>
              <SelectSearchable.Option value="17">Quinn Matthews</SelectSearchable.Option>
              <SelectSearchable.Option value="18">Rachel Cohen</SelectSearchable.Option>
              <SelectSearchable.Option value="19">Samuel Park</SelectSearchable.Option>
              <SelectSearchable.Option value="20">Tanya Ivanova</SelectSearchable.Option>
              <SelectSearchable.Option value="21">Uma Srinivasan</SelectSearchable.Option>
              <SelectSearchable.Option value="22">Victor Chen</SelectSearchable.Option>
              <SelectSearchable.Option value="23">William Turner</SelectSearchable.Option>
              <SelectSearchable.Option value="24">Xavier Morales</SelectSearchable.Option>
              <SelectSearchable.Option value="25">Yara Haddad</SelectSearchable.Option>
              <SelectSearchable.Option value="26">Zachary Phillips</SelectSearchable.Option>
              <SelectSearchable.Option value="27">Aiden Foster</SelectSearchable.Option>
              <SelectSearchable.Option value="28">Bianca Silva</SelectSearchable.Option>
              <SelectSearchable.Option value="29">Caleb Young</SelectSearchable.Option>
              <SelectSearchable.Option value="30">Diana Kowalski</SelectSearchable.Option>
            </SelectSearchable.OptionList>
          </SelectSearchable.Dropdown>
        </SelectSearchable.Root>
      </div>
    </>
  )
}

export default App
