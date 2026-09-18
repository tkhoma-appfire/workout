import { type CurrentPeriodState, CurrentPeriodContext } from '@/context/CurrentPeriodContextProvider'
import { useContext } from "react"
import { SlBadge } from 'react-icons/sl';

const greenShades = [
    'bg-green-100',
    'bg-green-200',
    'bg-green-300',
    'bg-green-400',
    'bg-green-500',
    'bg-green-600',
    'bg-green-700',
    'bg-green-800',
    'bg-green-900',
];

// if this variable is removed, orange shades will not be compiled to result css
const orangeShades = [
  'bg-orange-100',
  'bg-orange-200',
  'bg-orange-300',
  'bg-orange-400',
  'bg-orange-500',
  'bg-orange-600',
  'bg-orange-700',
  'bg-orange-800',
  'bg-orange-900',
];

function colorShade(num: number | undefined, min: number, max: number) {
    let colors = greenShades
    if (num === undefined || num == null) return colors[0]
    if (num <= min) return colors[0]
    if (num >= max) return colors[colors.length - 1]
    const ratio = (num - min) / (max - min)
    const index = Math.floor(ratio * (colors.length - 1))
    return colors[index]
}

const caloriesGoal = 1950

export default function Badge({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { state }: { state: CurrentPeriodState } = useContext(CurrentPeriodContext);

  let classes = 'w-10 h-10 text-white p-2 rounded '
  const calories = state?.statistics?.calories ?? 0
  classes += colorShade(calories, 200, caloriesGoal)
  const percentage = Math.round(calories / caloriesGoal * 100)
  
  return (
    <div {...props} title={`${percentage}% achieved this week`}>
      <SlBadge
        className={classes}
      />
     </div>
  )
}