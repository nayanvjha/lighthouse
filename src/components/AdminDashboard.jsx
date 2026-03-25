import { useCallback, useEffect, useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { getAllVisitors, getAllTraps, exportAsJSON, clearAllData } from '../utils/reconStore'

const ADMIN_PASSWORD = 'recon2024'

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const blink = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`

const scanLine = keyframes`
  0% { transform: translateY(-110%); }
  100% { transform: translateY(110%); }
`

const Page = styled.div`
  min-height: 100vh;
  background: #050505;
  color: #00ff41;
  font-family: 'Courier New', Courier, monospace;
`

const LoginScreen = styled(Page)`
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`

const LoginBox = styled.div`
  width: min(560px, 100%);
  border: 1px solid #00ff41;
  background: rgba(0, 0, 0, 0.82);
  padding: 26px;
  animation: ${fadeIn} 240ms ease-out;
`

const LoginTitle = styled.h1`
  margin: 0 0 10px;
  font-size: 22px;
  font-weight: 700;
  color: #00ff41;
`

const LoginSubtitle = styled.p`
  margin: 0 0 18px;
  color: rgba(0, 255, 65, 0.85);
  font-size: 14px;
`

const PasswordInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #00ff41;
  background: transparent;
  color: #00ff41;
  padding: 12px;
  outline: none;
  font: inherit;

  &::placeholder {
    color: rgba(0, 255, 65, 0.5);
  }
`

const AuthButton = styled.button`
  margin-top: 12px;
  border: 1px solid #00ff41;
  background: #00ff41;
  color: #000;
  padding: 11px 14px;
  font: inherit;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  font-weight: 700;

  &:hover {
    filter: brightness(0.95);
  }
`

const LoginError = styled.div`
  margin-top: 12px;
  color: #ff4444;
  font-size: 13px;
  text-transform: uppercase;
`

const BackLink = styled.a`
  display: inline-block;
  margin-top: 18px;
  color: #00ff41;
  text-decoration: none;
  border-bottom: 1px dashed rgba(0, 255, 65, 0.6);

  &:hover {
    color: #7dff9f;
    border-bottom-color: #7dff9f;
  }
`

const Dashboard = styled(Page)`
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    height: 120px;
    background: linear-gradient(180deg, rgba(0, 255, 65, 0.15), transparent);
    opacity: 0.1;
    animation: ${scanLine} 4.5s linear infinite;
    pointer-events: none;
    z-index: 0;
  }
`

const Container = styled.div`
  position: relative;
  z-index: 1;
  padding: 22px;
`

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;
`

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 28px;
  letter-spacing: 0.06em;
`

const Cursor = styled.span`
  display: inline-block;
  margin-left: 6px;
  animation: ${blink} 1s step-start infinite;
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`

const ActionButton = styled.button`
  border: 1px solid ${(p) => (p.$danger ? '#ff4444' : '#00ff41')};
  background: ${(p) => (p.$danger ? 'rgba(255, 68, 68, 0.1)' : 'transparent')};
  color: ${(p) => (p.$danger ? '#ff6666' : '#00ff41')};
  padding: 8px 11px;
  font: inherit;
  cursor: pointer;

  &:hover {
    filter: brightness(1.2);
  }
`

const StatsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const StatCard = styled.div`
  border: 1px solid rgba(0, 255, 65, 0.4);
  background: rgba(0, 0, 0, 0.72);
  padding: 12px;
  animation: ${fadeIn} 240ms ease-out;
`

const StatLabel = styled.div`
  font-size: 12px;
  color: rgba(0, 255, 65, 0.75);
`

const StatValue = styled.div`
  margin-top: 6px;
  font-size: 24px;
  color: ${(p) => p.$color || '#00ff41'};
`

const MainGrid = styled.section`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 14px;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`

const Panel = styled.div`
  border: 1px solid rgba(0, 255, 65, 0.35);
  background: rgba(0, 0, 0, 0.78);
  padding: 12px;
  animation: ${fadeIn} 240ms ease-out;
`

const PanelTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 16px;
`

const ScrollRegion = styled.div`
  overflow: auto;

  &::-webkit-scrollbar {
    width: 9px;
    height: 9px;
  }

  &::-webkit-scrollbar-track {
    background: #030303;
  }

  &::-webkit-scrollbar-thumb {
    background: #00ff41;
    border: 2px solid #030303;
  }
`

const VisitorTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  th,
  td {
    border-bottom: 1px solid rgba(0, 255, 65, 0.2);
    padding: 8px;
    text-align: left;
    vertical-align: top;
  }

  th {
    color: rgba(0, 255, 65, 0.75);
    font-weight: 700;
    position: sticky;
    top: 0;
    background: #020202;
    z-index: 2;
  }

  tbody tr {
    cursor: pointer;
    animation: ${fadeIn} 220ms ease-out;
  }

  tbody tr:hover {
    background: rgba(0, 255, 65, 0.08);
  }
`

const RiskBadge = styled.span`
  display: inline-block;
  border: 1px solid currentColor;
  border-radius: 999px;
  padding: 2px 8px;
  color: ${(p) => p.$color};
`

const TrapList = styled.div`
  max-height: 300px;
  overflow: auto;
  border: 1px solid rgba(0, 255, 65, 0.2);
  padding: 8px;

  &::-webkit-scrollbar {
    width: 9px;
  }

  &::-webkit-scrollbar-track {
    background: #030303;
  }

  &::-webkit-scrollbar-thumb {
    background: #00ff41;
    border: 2px solid #030303;
  }
`

const TrapItem = styled.div`
  padding: 8px;
  border-bottom: 1px dashed rgba(0, 255, 65, 0.2);
  font-size: 12px;
`

const TrapType = styled.span`
  color: #ff4444;
  text-transform: uppercase;
  font-weight: 700;
`

const Overlay = styled.button`
  position: fixed;
  inset: 0;
  border: 0;
  background: rgba(0, 0, 0, 0.62);
  cursor: pointer;
  z-index: 20;
`

const DetailPanel = styled.aside`
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: min(500px, 100%);
  background: #040404;
  border-left: 1px solid rgba(0, 255, 65, 0.4);
  z-index: 21;
  padding: 16px;
  overflow: auto;
  animation: ${fadeIn} 220ms ease-out;

  &::-webkit-scrollbar {
    width: 9px;
  }

  &::-webkit-scrollbar-track {
    background: #030303;
  }

  &::-webkit-scrollbar-thumb {
    background: #00ff41;
    border: 2px solid #030303;
  }
`

const CloseButton = styled.button`
  border: 1px solid #ff4444;
  color: #ff5555;
  background: transparent;
  font: inherit;
  padding: 6px 10px;
  cursor: pointer;
  margin-bottom: 12px;
`

const Section = styled.section`
  margin-bottom: 14px;
`

const SectionHeading = styled.h4`
  margin: 0 0 6px;
  font-size: 13px;
  color: #7dff9f;
`

const Pre = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  border: 1px solid rgba(0, 255, 65, 0.2);
  padding: 8px;
  background: rgba(0, 0, 0, 0.5);
`

function parseOS(ua = '') {
  if (!ua) return 'Unknown'
  if (/android/i.test(ua)) return 'Android'
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS'
  if (/macintosh|mac os x/i.test(ua)) return 'macOS'
  if (/windows/i.test(ua)) return 'Windows'
  if (/linux/i.test(ua)) return 'Linux'
  return 'Unknown'
}

function parseBrowser(ua = '') {
  if (!ua) return 'Unknown'
  if (/edg\//i.test(ua)) return 'Edge'
  if (/firefox\//i.test(ua)) return 'Firefox'
  if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) return 'Chrome'
  if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) return 'Safari'
  return 'Unknown'
}

function getRiskColor(score) {
  if (score >= 70) return '#ff4444'
  if (score >= 40) return '#ffd166'
  return '#00ff41'
}

function safeJson(value) {
  try {
    return JSON.stringify(value ?? {}, null, 2)
  } catch {
    return '{}'
  }
}

function formatPortLine(entry) {
  if (!entry) return 'No open ports found'
  const ms = typeof entry.latency === 'number' ? `${entry.latency}ms` : 'n/a'
  return `Port ${entry.port}: ${entry.service || 'Unknown Service'} (${ms})`
}

function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [visitors, setVisitors] = useState([])
  const [traps, setTraps] = useState([])
  const [selectedVisitor, setSelectedVisitor] = useState(null)

  const refreshData = useCallback(() => {
    const allVisitors = getAllVisitors() || []
    const allTraps = getAllTraps() || []
    setVisitors(Array.isArray(allVisitors) ? allVisitors : [])
    setTraps(Array.isArray(allTraps) ? allTraps : [])
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return undefined

    refreshData()
    const intervalId = window.setInterval(refreshData, 3000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isAuthenticated, refreshData])

  const stats = useMemo(() => {
    const totalVisitors = visitors.length
    const trapEvents = traps.length
    const avgRisk =
      visitors.length > 0
        ? Math.round(
            visitors.reduce((sum, v) => sum + Number(v?.risk?.score || 0), 0) / Math.max(visitors.length, 1),
          )
        : 0
    const openPortsFound = visitors.reduce((sum, v) => sum + (v?.ports?.open?.length || 0), 0)

    return {
      totalVisitors,
      trapEvents,
      avgRisk,
      openPortsFound,
    }
  }, [traps.length, visitors])

  const recentTraps = useMemo(() => {
    return [...traps].reverse().slice(0, 50)
  }, [traps])

  const handleLogin = (event) => {
    event.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setAuthError('')
      setPassword('')
      return
    }
    setAuthError('ACCESS DENIED')
  }

  const handleClearData = () => {
    clearAllData()
    setVisitors([])
    setTraps([])
    setSelectedVisitor(null)
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen>
        <LoginBox>
          <LoginTitle>$ sudo access --recon-dashboard</LoginTitle>
          <LoginSubtitle>Authorization required. Enter access key.</LoginSubtitle>

          <form onSubmit={handleLogin}>
            <PasswordInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter access key"
              autoComplete="off"
            />
            <AuthButton type="submit">AUTHENTICATE</AuthButton>
          </form>

          {authError ? <LoginError>{authError}</LoginError> : null}

          <BackLink href="/">&larr; Back to portfolio</BackLink>
        </LoginBox>
      </LoginScreen>
    )
  }

  return (
    <Dashboard>
      <Container>
        <Header>
          <HeaderTitle>
            RECON DASHBOARD
            <Cursor>_</Cursor>
          </HeaderTitle>

          <HeaderActions>
            <BackLink href="/">&larr; Back to portfolio</BackLink>
            <ActionButton type="button" onClick={refreshData}>
              Refresh
            </ActionButton>
            <ActionButton type="button" onClick={exportAsJSON}>
              Export JSON
            </ActionButton>
            <ActionButton type="button" $danger onClick={handleClearData}>
              Clear Data
            </ActionButton>
          </HeaderActions>
        </Header>

        <StatsGrid>
          <StatCard>
            <StatLabel>Total Visitors</StatLabel>
            <StatValue>{stats.totalVisitors}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Trap Events</StatLabel>
            <StatValue $color="#ff4444">{stats.trapEvents}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Avg Risk Score</StatLabel>
            <StatValue $color={getRiskColor(stats.avgRisk)}>{stats.avgRisk}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Open Ports Found</StatLabel>
            <StatValue $color="#ffd166">{stats.openPortsFound}</StatValue>
          </StatCard>
        </StatsGrid>

        <MainGrid>
          <Panel>
            <PanelTitle>Visitor Table</PanelTitle>
            <ScrollRegion>
              <VisitorTable>
                <thead>
                  <tr>
                    <th>Hash</th>
                    <th>IP (WebRTC)</th>
                    <th>User Agent</th>
                    <th>OS</th>
                    <th>Browser</th>
                    <th>Risk</th>
                    <th>Open Ports</th>
                    <th>Visits</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((visitor) => {
                    const ua = visitor?.browser?.userAgent || visitor?.userAgent || ''
                    const ip = visitor?.webrtc?.public?.[0] || visitor?.webrtc?.private?.[0] || 'N/A'
                    const risk = Number(visitor?.risk?.score || 0)
                    return (
                      <tr
                        key={`${visitor?.visitorHash || 'UNKNOWN'}-${visitor?.lastSeen || visitor?.timestamp || ''}`}
                        onClick={() => setSelectedVisitor(visitor)}
                      >
                        <td>{visitor?.visitorHash || 'UNKNOWN'}</td>
                        <td>{ip}</td>
                        <td>{ua ? `${ua.slice(0, 40)}${ua.length > 40 ? '...' : ''}` : 'N/A'}</td>
                        <td>{parseOS(ua)}</td>
                        <td>{parseBrowser(ua)}</td>
                        <td>
                          <RiskBadge $color={getRiskColor(risk)}>{risk}</RiskBadge>
                        </td>
                        <td>{visitor?.ports?.open?.length || 0}</td>
                        <td>{visitor?.visitCount || 1}</td>
                      </tr>
                    )
                  })}
                  {visitors.length === 0 ? (
                    <tr>
                      <td colSpan={8}>No visitor data recorded yet.</td>
                    </tr>
                  ) : null}
                </tbody>
              </VisitorTable>
            </ScrollRegion>
          </Panel>

          <Panel>
            <PanelTitle>Canary Trap Feed</PanelTitle>
            <TrapList>
              {recentTraps.map((trap, index) => {
                const stamp = trap?.timestamp || new Date().toISOString()
                const type = String(trap?.type || 'unknown').toUpperCase()
                const detail = trap?.detail ?? {}
                return (
                  <TrapItem key={`${stamp}-${index}`}>
                    {stamp} | <TrapType>{type}</TrapType> | {safeJson(detail)}
                  </TrapItem>
                )
              })}
              {recentTraps.length === 0 ? <TrapItem>No trap events recorded.</TrapItem> : null}
            </TrapList>
          </Panel>
        </MainGrid>
      </Container>

      {selectedVisitor ? (
        <>
          <Overlay type="button" onClick={() => setSelectedVisitor(null)} aria-label="Close details" />
          <DetailPanel>
            <CloseButton type="button" onClick={() => setSelectedVisitor(null)}>
              [X] CLOSE
            </CloseButton>

            <Section>
              <SectionHeading>Risk Assessment</SectionHeading>
              <Pre>{safeJson(selectedVisitor?.risk || { score: 0, details: [] })}</Pre>
            </Section>

            <Section>
              <SectionHeading>Browser &amp; System</SectionHeading>
              <Pre>{safeJson(selectedVisitor?.browser || {})}</Pre>
            </Section>

            <Section>
              <SectionHeading>WebRTC IP Leak</SectionHeading>
              <Pre>{safeJson(selectedVisitor?.webrtc || {})}</Pre>
            </Section>

            <Section>
              <SectionHeading>Open Ports</SectionHeading>
              <Pre>
                {(selectedVisitor?.ports?.open || []).length > 0
                  ? selectedVisitor.ports.open.map((entry) => formatPortLine(entry)).join('\n')
                  : 'No open ports found'}
              </Pre>
            </Section>

            <Section>
              <SectionHeading>Social Sessions</SectionHeading>
              <Pre>
                {(selectedVisitor?.social?.loggedIn || []).length > 0
                  ? `Logged into: ${selectedVisitor.social.loggedIn.join(', ')}`
                  : 'No active sessions detected'}
              </Pre>
            </Section>

            <Section>
              <SectionHeading>Hardware/WebGL</SectionHeading>
              <Pre>{safeJson(selectedVisitor?.webgl || {})}</Pre>
            </Section>

            <Section>
              <SectionHeading>Canvas Fingerprint</SectionHeading>
              <Pre>{safeJson(selectedVisitor?.canvas || {})}</Pre>
            </Section>

            <Section>
              <SectionHeading>Audio Fingerprint</SectionHeading>
              <Pre>{safeJson(selectedVisitor?.audio || {})}</Pre>
            </Section>

            <Section>
              <SectionHeading>Installed Fonts</SectionHeading>
              <Pre>{safeJson(selectedVisitor?.fonts || {})}</Pre>
            </Section>

            <Section>
              <SectionHeading>Network</SectionHeading>
              <Pre>{safeJson(selectedVisitor?.network || {})}</Pre>
            </Section>

            <Section>
              <SectionHeading>Battery</SectionHeading>
              <Pre>{safeJson(selectedVisitor?.battery || {})}</Pre>
            </Section>

            <Section>
              <SectionHeading>Permissions</SectionHeading>
              <Pre>{safeJson(selectedVisitor?.permissions || {})}</Pre>
            </Section>

            <Section>
              <SectionHeading>Behavior</SectionHeading>
              <Pre>{safeJson(selectedVisitor?.behavior || {})}</Pre>
            </Section>
          </DetailPanel>
        </>
      ) : null}
    </Dashboard>
  )
}

export default AdminDashboard
