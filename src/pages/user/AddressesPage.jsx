import PageWrapper    from '../../components/layout/PageWrapper';
import DashboardShell from '../../components/layout/DashboardShell';
import AddressSelector from '../../components/checkout/AddressSelector';
import { useState }   from 'react';

export default function AddressesPage() {
  const [selected, setSelected] = useState(null);

  return (
    <PageWrapper>
      <DashboardShell title="Saved Addresses" subtitle="Delivery">
        <AddressSelector selectedId={selected} onSelect={setSelected} />
      </DashboardShell>
    </PageWrapper>
  );
}