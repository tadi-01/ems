'use client'

import { Grid, Column, Tile } from '@carbon/react'

const colorTokens = [
  { token: 'interactive', varName: '--cds-interactive' },
  { token: 'background-brand', varName: '--cds-background-brand' },
  { token: 'support-error', varName: '--cds-support-error' },
  { token: 'support-success', varName: '--cds-support-success' },
  { token: 'support-warning', varName: '--cds-support-warning' },
  { token: 'support-info', varName: '--cds-support-info' },
  { token: 'background-inverse', varName: '--cds-background-inverse' },
  { token: 'border-interactive', varName: '--cds-border-interactive' },
]

const typeStyles = [
  {
    name: 'heading-04',
    label: 'Heading 04',
    className: 'type-demo--heading-04',
  },
  {
    name: 'heading-03',
    label: 'Heading 03',
    className: 'type-demo--heading-03',
  },
  { name: 'body-01', label: 'Body 01', className: 'type-demo--body-01' },
  { name: 'label-01', label: 'Label 01', className: 'type-demo--label-01' },
  { name: 'code-01', label: 'Code 01', className: 'type-demo--code-01' },
]

export function Foundations() {
  return (
    <section id="foundations" className="section">
      <Grid>
        <Column sm={4} md={8} lg={16}>
          <h2 className="section__title">Foundations</h2>
          <p className="section__subtitle">
            Design tokens for color, IBM Plex typography, and the 2x grid are
            the basis of every Carbon experience.
          </p>
        </Column>

        <Column sm={4} md={8} lg={8}>
          <Tile className="foundation-tile">
            <h3 className="foundation-tile__title">Color tokens</h3>
            <ul className="swatch-grid" aria-label="Carbon color tokens">
              {colorTokens.map((c) => (
                <li key={c.token} className="swatch">
                  <span
                    className="swatch__chip"
                    style={{ background: `var(${c.varName})` }}
                  />
                  <code className="swatch__label">{c.token}</code>
                </li>
              ))}
            </ul>
          </Tile>
        </Column>

        <Column sm={4} md={8} lg={8}>
          <Tile className="foundation-tile">
            <h3 className="foundation-tile__title">IBM Plex type scale</h3>
            <ul className="type-list" aria-label="Carbon type scale">
              {typeStyles.map((t) => (
                <li key={t.name} className="type-list__row">
                  <span className={`type-demo ${t.className}`}>{t.label}</span>
                  <code className="type-list__token">{t.name}</code>
                </li>
              ))}
            </ul>
          </Tile>
        </Column>
      </Grid>
    </section>
  )
}
