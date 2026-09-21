export default function CheckboxSlider({checked, checkHandler}: {checked: boolean, checkHandler: (checked: boolean) => void}) {
	return (
		<label className="relative inline-block w-12 h-6 cursor-pointer">
			<input
				type="checkbox"
				checked={checked}
				onChange={() => checkHandler(!checked)}
				className="peer sr-only"
			/>
			<div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors duration-300"></div>
			<div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md peer-checked:translate-x-6 transition-transform duration-300"></div>
		</label>
	);
}
