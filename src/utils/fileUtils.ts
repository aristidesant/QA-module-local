/**
 * Downloads a blob as a file in the browser.
 *
 * @param blob - The blob data to download
 * @param filename - The name of the file
 */
export const downloadBlob = (blob: Blob, filename: string) => {
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	// Defer revocation so the browser has time to start the download.
	window.setTimeout(() => {
		window.URL.revokeObjectURL(url);
	}, 1000);
};
