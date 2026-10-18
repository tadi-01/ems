'use client'

import { Header, HeaderName, HeaderGlobalBar, HeaderGlobalAction, SkipToContent, Tag } from '@carbon/react'
import { Asleep, Light, Layers } from '@carbon/icons-react'
import { useTheme } from '@/components/theme-provider'

export function SiteHeader() {
  const { theme, toggleTheme } = useTheme()
  return (
    <Header aria-label="Forma" className="forma-header">
      <SkipToContent />
      <HeaderName href="/" prefix=""><Layers size={24} /><span>forma</span></HeaderName>
      <HeaderGlobalBar>
        <Tag type="gray" size="sm">Preview</Tag>
        <HeaderGlobalAction aria-label={theme === 'g100' ? 'Switch to light theme' : 'Switch to dark theme'} tooltipAlignment="end" onClick={toggleTheme}>
          {theme === 'g100' ? <Light size={20} /> : <Asleep size={20} />}
        </HeaderGlobalAction>
      </HeaderGlobalBar>
    </Header>
  )
}
