'use client'

import { useEffect, useState } from 'react'
import {
  Grid,
  Column,
  DataTable,
  DataTableSkeleton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Tag,
} from '@carbon/react'

const headers = [
  { key: 'name', header: 'Name' },
  { key: 'type', header: 'Type' },
  { key: 'region', header: 'Region' },
  { key: 'status', header: 'Status' },
]

const rows = [
  {
    id: '1',
    name: 'cloud-platform-prod',
    type: 'Kubernetes cluster',
    region: 'US East',
    status: 'Active',
  },
  {
    id: '2',
    name: 'ml-training-pipeline',
    type: 'Code engine',
    region: 'US South',
    status: 'Active',
  },
  {
    id: '3',
    name: 'customer-events-db',
    type: 'PostgreSQL',
    region: 'EU (Frankfurt)',
    status: 'Maintenance',
  },
  {
    id: '4',
    name: 'edge-gateway-tokyo',
    type: 'API gateway',
    region: 'Asia Pacific',
    status: 'Stopped',
  },
]

const statusTag: Record<string, 'green' | 'magenta' | 'gray'> = {
  Active: 'green',
  Maintenance: 'magenta',
  Stopped: 'gray',
}

export function ResourceTable() {
  // DataTable generates auto-incrementing instance ids that differ between
  // server and client render passes, so render it after mount with Carbon's
  // skeleton as the SSR placeholder.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <section id="patterns" className="section">
      <Grid>
        <Column sm={4} md={8} lg={16}>
          <h2 className="section__title">Data display</h2>
          <p className="section__subtitle">
            DataTable composes Carbon&apos;s table primitives with sorting and
            accessible markup out of the box.
          </p>
          {!mounted ? (
            <DataTableSkeleton
              headers={headers}
              rowCount={4}
              columnCount={headers.length}
              showHeader
              showToolbar={false}
            />
          ) : (
            <DataTable rows={rows} headers={headers} isSortable>
              {({
                rows,
                headers,
                getTableProps,
                getHeaderProps,
                getRowProps,
              }) => (
                <TableContainer
                  title="Resources"
                  description="All resources in this account"
                >
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader
                            {...getHeaderProps({ header })}
                            key={header.key}
                          >
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow {...getRowProps({ row })} key={row.id}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>
                              {cell.info.header === 'status' ? (
                                <Tag
                                  type={
                                    statusTag[cell.value as string] ?? 'gray'
                                  }
                                >
                                  {cell.value}
                                </Tag>
                              ) : (
                                cell.value
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
          )}
        </Column>
      </Grid>
    </section>
  )
}
