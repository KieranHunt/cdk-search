import * as Dialog from "@radix-ui/react-dialog";

export function ThemeDialog() {
	return (
		<Dialog.Root>
			<Dialog.Trigger asChild>
				<button
					type="button"
					className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
				>
					Open Dialog
				</button>
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
				<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-lg bg-white p-6 shadow-xl focus:outline-none">
					<Dialog.Title className="text-lg font-semibold text-gray-900">Radix Dialog</Dialog.Title>
					<Dialog.Description className="mt-2 text-sm text-gray-600">
						This dialog is built with @radix-ui/react-dialog and styled with Tailwind CSS. It
						demonstrates that Radix primitives work correctly inside a standalone HTML file built by
						Bun.
					</Dialog.Description>

					<div className="mt-6 flex justify-end">
						<Dialog.Close asChild>
							<button
								type="button"
								className="inline-flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
							>
								Close
							</button>
						</Dialog.Close>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
