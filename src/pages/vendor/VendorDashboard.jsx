import PageWrapper    from '../../components/layout/PageWrapper';
import DashboardShell from '../../components/layout/DashboardShell';

export default function VendorDashboard() {
  return (
    <PageWrapper>
      <DashboardShell title="Vendor Dashboard" subtitle="Overview">
        <div className="text-center py-20">
          <p className="font-display text-3xl text-cream mb-3">Vendor Panel</p>
          <p className="text-stone text-sm">Phase 9 will build this fully.</p>
        </div>
      </DashboardShell>
    </PageWrapper>
  );
}