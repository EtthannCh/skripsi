<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { createSvelteTable, FlexRender, renderComponent } from '$lib/components/ui/data-table';
	import DataTableActions from '$lib/components/ui/data-table/data-table-actions.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { type ColumnDef, type TableOptions } from '@tanstack/svelte-table';
	import { getCoreRowModel } from '@tanstack/table-core';
	import { toast } from 'svelte-sonner';
	import { fileProxy, superForm, message } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { PageData } from './$types';
	import {
		requestDbStatusCombobox,
		userRequestSchema,
		type RequestDbSchema,
		type UserCookiesSchema
	} from './user-schema';
	import { debounce } from '$lib/utils';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils.js';
	import DataTableLink from '$lib/components/ui/data-table/data-table-link.svelte';
	import DataTableMultipleRowCell from '$lib/components/ui/data-table/data-table-multiple-row-cell.svelte';

	let { data }: { data: PageData } = $props();
	const user: UserCookiesSchema = data.user;
	let submitPressed = $state(false);
	let open = $state(false);
	let value = $state('');
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedValue = $derived(requestDbStatusCombobox.find((f) => f.value === value)?.label);

	const form = superForm(data.form, {
		validators: zodClient(userRequestSchema),
		onResult: ({ result }) => {
			console.log(result);

			if (result.type == 'success') {
				toast.success('Successfully Saved', {
					position: 'top-right',
					dismissable: true
				});
				goto('/home');
				invalidateAll();
			} else {
				toast.info('Invalid Form / File size too big', {
					position: 'top-right',
					dismissable: true
				});
			}
		},
		dataType: 'json'
	});

	const formSelection = data.formSelection.map((v) => {
		return {
			label: v.code,
			value: v.id.toString()
		};
	});

	const defaultColumns: ColumnDef<RequestDbSchema>[] = [
		{
			accessorKey: 'id',
			accessorFn: (row) => row.id,
			size: 150,
			cell: ({ row }) => {
				return '';
			},
			header: ''
		},
		{
			accessorKey: 'status',
			accessorFn: (row) => row.status,
			header: 'Status Permohonan',
			size: 100
		},
		{
			accessorKey: 'user_name',
			accessorFn: (row) => row.created_by,
			header: 'Nama Pemohon',
			size: 100
		},
		{
			accessorKey: 'nim',
			accessorFn: (row) => row.user_credentials.email.split('@')[0],
			header: 'NIM Pemohon'
		},
		{
			accessorKey: 'form_code',
			accessorFn: (row) => row.form_db.code,
			header: 'Kode Form',
			size: 100
		},
		{
			accessorKey: 'created_at',
			accessorFn: (row) => row.created_at,
			header: 'Tanggal Permohonan',
			cell: ({ row }) => {
				return renderComponent(DataTableMultipleRowCell, {
					value: new Date(row.original.created_at).toLocaleDateString('id-ID', {
						day: '2-digit',
						month: 'short',
						year: 'numeric'
					}),
					value1: new Date(row.original.created_at).toLocaleTimeString()
				});
			}
		},
		{
			accessorKey: 'reason',
			accessorFn: (row) => row.reason ?? '',
			header: 'Alasan'
		},
		{
			accessorKey: 'form_url',
			accessorFn: (row) => row.form_url ?? '',
			header: 'Form Permohonan',
			cell: ({ row }) => {
				console.log(row.original.form_url);

				return renderComponent(DataTableLink, { url: row.original.form_url });
			}
		},
		{
			accessorKey: 'action',
			header: '',
			cell: ({ row }) => {
				if (
					row.original.status == 'REJECTED' ||
					row.original.status == 'APPROVED' ||
					(row.original.status == 'AWAITING_APPROVAL' && user.roleId != 2) ||
					(row.original.status == 'PENDING' && user.roleId != 1)
				) {
					return;
				} else {
					return renderComponent(DataTableActions, {
						id: row.original.id.toString(),
						approveFunc: async () => handleActions(user.roleId.toString(), row.original.id),
						rejectFunc: async () => handleActions('REJECTED', row.original.id)
					});
				}
			}
		}
	];

	const options: TableOptions<RequestDbSchema> = {
		get data() {
			return data.requestDbData;
		},
		columns: defaultColumns,
		getCoreRowModel: getCoreRowModel(),
		enableColumnResizing: true
	};

	const table = createSvelteTable(options);

	let openDialog = $state(false);

	const { form: formData, enhance, errors } = form;
	const file = fileProxy(form, 'formFile');

	const handleActions = async (param: string, id: number) => {
		let tempParam = '';
		if (param == '1') {
			tempParam = 'AWAITING_APPROVAL';
		} else if (param == '2') {
			tempParam = 'APPROVED';
		} else {
			tempParam = param;
		}
		const response = await fetch('/home', {
			method: 'post',
			body: JSON.stringify({
				status: tempParam,
				id
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (response.status.toString() == '200') {
			toast.success('Success', {
				position: 'top-right',
				dismissable: true
			});
		}
		await goto('/home', { invalidateAll: true });
	};

	let filter: string = $state('');

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}
</script>

{#if user.roleId == 3 && user.roleId}
	<Accordion.Root
		type="single"
		class="mx-auto my-auto flex w-[700px] flex-col justify-center sm:max-w-[30%] md:max-w-[50%] lg:max-w-[100%]"
	>
		<Accordion.Item value="item-1">
			<Accordion.Trigger>Pengambilan Form</Accordion.Trigger>
			<Accordion.Content>
				{#each data.formSelection as form}
					<Card.Root class="my-5 flex w-full items-center justify-between">
						<Card.Header class="px-5 py-0">
							<Card.Title>{form.name}</Card.Title>
							<Card.Description>{form.description ?? 'Tidak Ada Penjelasan'}</Card.Description>
						</Card.Header>
						<Card.Content class="grid gap-4">
							<div class="flex flex-col items-center justify-center gap-0.5 text-right">
								<Label>{form.code}</Label>
								<span
									><a
										href={`/api/pdf/${form.id}`}
										download={form.name}
										class="group relative text-[#18272F] no-underline"
									>
										Download PDF
										<span
											class="absolute bottom-0 left-0 h-[2px] w-full origin-right scale-x-0 rounded-sm bg-[#18272F] transition-transform group-hover:origin-left group-hover:scale-x-100"
										></span>
									</a></span
								>
							</div>
						</Card.Content>
					</Card.Root>
				{/each}
			</Accordion.Content>
		</Accordion.Item>
		<Accordion.Item value="item-2">
			<Accordion.Trigger>Pengajuan Form</Accordion.Trigger>
			<Accordion.Content>
				<form action="?/submit" enctype="multipart/form-data" method="post" use:enhance>
					<Form.Field {form} name="userId">
						<Form.Control let:attrs>
							<Input bind:value={user.userId} type="hidden" />
						</Form.Control>
					</Form.Field>
					<div class="flex flex-col gap-5">
						<div>
							<Label>User Name</Label>
							<Input value={user.username} disabled />
						</div>
						<div>
							<Label>User Email</Label>
							<Input value={user.email} disabled />
						</div>
					</div>
					<Form.Field {form} name="formId">
						<Form.Control let:attrs>
							<div class="my-5 flex w-full flex-col gap-5">
								<Form.Label>Jenis Form</Form.Label>
								<Select.Root type="single" name="formId" bind:value={$formData.formId}>
									<Select.Trigger>
										{formSelection.find((v) => v.value == $formData.formId)?.label ?? 'Pilih Form'}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											{#each formSelection as form}
												<Select.Item value={form.value} label={form.label}>{form.label}</Select.Item
												>
											{/each}
										</Select.Group>
									</Select.Content>
									{#if $formData.formId == '' && submitPressed}
										<span class="text-red-700">Belum Memilih Jenis Form</span>
									{/if}
								</Select.Root>
							</div>
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="formFile">
						<Form.Control let:attrs>
							<div class="flex flex-col gap-5">
								<Form.Label>{`Upload Form Permohonan (Max Size Allowed :  5mb)`}</Form.Label>
								<input accept="application/pdf" type="file" bind:files={$file} />
							</div>
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Button
						class="my-5 bg-black text-white"
						type="submit"
						onclick={() => {
							submitPressed = true;
						}}>Submit</Form.Button
					>
				</form>
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
{:else}
	<div
		class="m-3 mx-auto h-[600px] w-[1000px] overflow-y-scroll rounded-md border-2 border-gray-500 p-5"
	>
		<div class="flex flex-row items-center">
			<div class="mx-3 my-5 flex flex-row items-center gap-5">
				<Label>Search</Label>
				<Input
					class="w-[100px] border-2 border-black"
					onchange={() => {
						debounce(
							async () =>
								await goto(`/home?${filter.length > 0 ? `filter=${filter}` : ''}`, {
									invalidateAll: true,
									replaceState: true
								}),
							500
						);
					}}
					bind:value={filter}
				/>
			</div>
			<div class="mx-5 flex flex-row items-center gap-5">
				<Label>Status</Label>
				<Popover.Root bind:open>
					<Popover.Trigger bind:ref={triggerRef}>
						{#snippet child({ props })}
							<Button
								variant="outline"
								class="w-[200px] justify-between"
								{...props}
								role="combobox"
								aria-expanded={open}
							>
								{selectedValue || 'Pilih Status'}
								<ChevronsUpDown class="opacity-50" />
							</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content class="w-[200px] p-0">
						<Command.Root>
							<Command.Input placeholder="Cari Status..." />
							<Command.List>
								<Command.Empty>No framework found.</Command.Empty>
								<Command.Group>
									{#each requestDbStatusCombobox as status}
										<Command.Item
											value={status.value}
											onSelect={() => {
												value = status.value;
												closeAndFocusTrigger();
											}}
										>
											<Check class={cn(value !== status.value && 'text-transparent')} />
											{status.label}
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.List>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
			</div>
		</div>
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup}
					<Table.Row>
						{#each headerGroup.headers as header}
							<Table.Head>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row}
					<Table.Row data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{/if}

<Dialog.Root bind:open={openDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Confirmation Dialog</Dialog.Title>
			<Dialog.Description>Are you sure</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button type="submit">Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
