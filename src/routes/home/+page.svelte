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
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { PageData } from './$types';
	import { userRequestSchema, type RequestDbSchema, type UserCookiesSchema } from './user-schema';

	let { data }: { data: PageData } = $props();
	const user: UserCookiesSchema = data.user;
	let submitPressed = $state(false);

	const form = superForm(data.form, {
		validators: zodClient(userRequestSchema),
		onResult: ({ result }) => {
			if (result.type == 'success') {
				toast.success('Successfully Saved', {
					position: 'top-right',
					dismissable: true
				});
				goto('/home');
				invalidateAll();
			} else {
				toast.info('Check Again', {
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

	const defaultData: RequestDbSchema[] = data.requestDbData;

	const defaultColumns: ColumnDef<RequestDbSchema>[] = [
		{
			accessorKey: 'id',
			accessorFn: (row) => row.id,
			size: 150,
			cell: ({ row }) => {
				return row.original.id;
			}
		},
		{
			accessorKey: 'status',
			accessorFn: (row) => row.status,
			header: 'Status Permohonan',
			size: 100
		},
		{
			accessorKey: 'user_id',
			accessorFn: (row) => row.user_id,
			header: 'User ID',
			size: 100
		},
		{
			accessorKey: 'formId',
			accessorFn: (row) => row.form_id,
			header: 'Form ID',
			size: 100
		},
		{
			accessorKey: 'reason',
			accessorFn: (row) => row.reason ?? '',
			header: 'Alasan'
		},
		{
			accessorKey: 'action',
			header: '',
			cell: ({ row }) => {
				return renderComponent(DataTableActions, {
					id: row.original.id.toString(),
					approveFunc: async () => handleActions('approve', row.original.id),
					rejectFunc: async () => handleActions('reject', row.original.id)
				});
			}
		}
	];

	const options: TableOptions<RequestDbSchema> = $state({
		data: defaultData,
		columns: defaultColumns,
		getCoreRowModel: getCoreRowModel(),
		enableColumnResizing: true
	});

	const table = createSvelteTable(options);
	let openDialog = $state(false);

	const { form: formData, enhance, errors } = form;
	const file = fileProxy(form, 'formFile');

	const handleActions = async (param: string, id: number) => {
		const response = await fetch('/home', {
			method: 'post',
			body: JSON.stringify({
				status: param,
				id
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
	};
</script>
{#each defaultData as row}
	<span>{row.user_id}</span>
{/each}
{#if user.roleId == 3}
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
								<Select.Root type="single" name="favoriteFruit" bind:value={$formData.formId}>
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
							<Form.Label>Upload Form Permohonan</Form.Label>
							<input accept="application/pdf" type="file" bind:files={$file} />
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
	<Table.Root class="mx-auto w-[1000px]">
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
