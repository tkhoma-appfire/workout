import { Button, Checkbox, Select } from "antd";
import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import type { ExerciseNameOption } from "@/types";
import WorkoutDetail from "@/components/general/WorkoutDetail";
import WorkoutPieChart from "@/components/general/UI/chart/WorkoutPieChart";
import { BsFlagFill } from "react-icons/bs";
import { MdSearch } from "react-icons/md";
import { apiUrl } from "@/utils/http";

const SearchAndCompare = () => {
  const exerciseOptions = useLoaderData() as ExerciseNameOption[];
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [onlySelected, setOnlySelected] = useState(false);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [rightWorkout, setRightWorkout] = useState(null);
  const [leftWorkout, setLeftWorkout] = useState(null);

  const search = async () => {
    const params = new URLSearchParams();
    if (selectedIds.length > 0) {
      params.set("exercises", selectedIds.join(","));
    }
    if (onlySelected && selectedIds.length > 0) {
      params.set("onlySelected", "true");
    }
    const query = params.toString();
    const response = await fetch(apiUrl(`/api/search${query ? `?${query}` : ""}`));
    const data = await response.json();
    setWorkouts(data);
  };

  const showFlagged = async () => {
    const response = await fetch(apiUrl("/api/flagged"));
    const data = await response.json();
    setWorkouts(data);
  };

  useEffect(() => {
    search();
  }, []);

  const selectWorkout = (workout: any, checked: boolean) => {
      if (checked) {
          setRightWorkout(workout)
      } else {
          setLeftWorkout(workout);
      }
    }

  return (
    <div className="mt-12">
      <div className="w-full flex justify-evenly">
        <Select
          mode="multiple"
          className="w-[30%] [&_.ant-select-selector]:border-slate-300"
          value={selectedIds}
          onChange={setSelectedIds}
          options={exerciseOptions}
          placeholder="Choose exercises..."
          allowClear
          showSearch
          getPopupContainer={() => document.body}
          filterOption={(input, option) => {
            const q = input.trim().toLowerCase();
            if (!q) return true;
            const label = String(option?.label ?? option?.value ?? "").toLowerCase();
            const value = String(option?.value ?? "").toLowerCase();
            return label.includes(q) || value.includes(q);
          }}
        />
        <div className="flex items-center">
          <Checkbox
            checked={onlySelected}
            disabled={selectedIds.length === 0}
            onChange={(e) => setOnlySelected(e.target.checked)}
          >
            Only selected
          </Checkbox>
        </div>
        <Button type="primary" onClick={search}>
          <span className="text-white mr-2">
            <MdSearch />
          </span>
          <span className="text-white">Search</span>
        </Button>
        <Button type="default" onClick={showFlagged}>
          <span className="text-red-600 mr-2">
            <BsFlagFill />
          </span>
          <span className="text-sky-600">Show Flagged</span>
        </Button>
      </div>
      <div className="w-full mt-4 pr-2">
        <WorkoutDetail
          workouts={workouts}
          showCheckbox
          selectWorkout={selectWorkout}
        />
      </div>
      <div className="w-full flex mt-8">
        <div className="flex-1 flex items-center justify-center bg-blue-100">
          <WorkoutPieChart workout={leftWorkout} />
        </div>
        <div className="w-px bg-gray-400"></div>
        <div className="flex-1 flex items-center justify-center bg-green-100">
          <WorkoutPieChart workout={rightWorkout} />
        </div>
      </div>
    </div>
  );
};

export default SearchAndCompare;