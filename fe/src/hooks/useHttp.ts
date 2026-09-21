import { useState, useEffect, useCallback } from 'react'
import { apiUrl } from '@/utils/http'

async function sendHttpRequest(url: string, config: RequestInit) {
	const response = await fetch(apiUrl(url), config)

	const resData = await response.json()

	if (!response.ok) {
		throw new Error(resData.message || 'Something went wrong, failed to send request.')
	}

	return resData
}

export default function useHttp<T>(url: string, config: RequestInit, initialData: T) {
	const [data, setData] = useState<T>(initialData)
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	function clearData() {
		setData(initialData)
	}

	const sendRequest = useCallback(
		async function sendRequest(data: any | null = null) {
			setIsLoading(true)
			try {
				const resData = await sendHttpRequest(url, { ...config, body: data})
				setData(resData)
			} catch(error: any) {
				setError(error.message || 'Something went wrong')
			}
			setIsLoading(false)
		}, [url, config])

	useEffect(() => {
		if (config && (config.method === 'GET' || !config.method) || !config) {
			sendRequest()
		}
	}, [sendRequest, config])

	return {
		data,
		isLoading,
		error,
		sendRequest,
		clearData
	}
}
