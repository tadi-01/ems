'use client'

import { Grid, Column, Button, Tag } from '@carbon/react'
import { ArrowRight, Launch } from '@carbon/icons-react'

export function Hero() {
  return (
    <section className="hero">
      <Grid>
        <Column sm={4} md={6} lg={9}>
          <Tag type="blue" size="md">
            v11
          </Tag>
          <h1 className="hero__title">Carbon Design System</h1>
          <p className="hero__subtitle">
            {
              "Carbon is IBM's open-source design system for products and digital experiences. With the IBM Design Language as its foundation, it consists of working code, design tools and resources, and human interface guidelines."
            }
          </p>
          <div className="hero__actions">
            <Button renderIcon={ArrowRight}>Get started</Button>
            <Button kind="tertiary" renderIcon={Launch}>
              View on GitHub
            </Button>
          </div>
        </Column>
      </Grid>
    </section>
  )
}
