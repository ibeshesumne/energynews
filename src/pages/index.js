import { useState } from 'react';

export default function Home({ data }) {
  const [formData, setFormData] = useState({
    id: '',
    newsdate: '',
    reportdate: '',
    place: '',
    what: '',
    actiondate: '',
    meta: '',
    url: ''
  });

  const [search, setSearch] = useState('');

  const handleDownload = () => {
    const fileData = JSON.stringify(data, null, 2);
    const blob = new Blob([fileData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = url;
    link.download = `registry-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/commit-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (response.ok) {
      alert(formData.id ? 'Entry updated!' : 'Entry added!');
      window.location.reload();
    }
  };

  const handleEdit = (entry) => {
    setFormData(entry);
    window.scrollTo(0, 0); // scroll to top to view form
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this entry?');
    if (!confirmed) return;
  
    const response = await fetch(`/api/delete-entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  
    if (response.ok) {
      const updated = await fetch('/api/entries');
      const freshData = await updated.json();
      setEntries(freshData);
    } else {
      alert('Failed to delete entry.');
    }
  };
  
  const filteredData = data.filter(
    (item) =>
      item.place?.toLowerCase().includes(search.toLowerCase()) ||
      item.what?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Registry</h1>

      <form onSubmit={handleSubmit}>
        <input type="hidden" value={formData.id || ''} />

        <input type="date" placeholder="News Date" value={formData.newsdate || ''}
          onChange={(e) => setFormData({ ...formData, newsdate: e.target.value })} />

        <input type="date" placeholder="Report Date" value={formData.reportdate || ''}
          onChange={(e) => setFormData({ ...formData, reportdate: e.target.value })} />

        <input type="date" placeholder="Action Date" value={formData.actiondate || ''}
          onChange={(e) => setFormData({ ...formData, actiondate: e.target.value })} />

        <input type="text" placeholder="Place" value={formData.place || ''}
          onChange={(e) => setFormData({ ...formData, place: e.target.value })} />

        <input type="text" placeholder="What" value={formData.what || ''}
          onChange={(e) => setFormData({ ...formData, what: e.target.value })} />

        <input type="text" placeholder="Meta" value={formData.meta || ''}
          onChange={(e) => setFormData({ ...formData, meta: e.target.value })} />

        <input type="text" placeholder="URL" value={formData.url || ''}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })} />

        <button type="submit">{formData.id ? 'Update Entry' : 'Add Entry'}</button>
      </form>

      <input type="text" placeholder="Search..." style={{ marginTop: '20px', width: '300px' }}
        value={search} onChange={(e) => setSearch(e.target.value)} />

      <button onClick={handleDownload} style={{ margin: '20px 10px 0 0' }}>
        ⬇️ Download JSON
      </button>

      <table style={{ marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>News Date</th>
            <th>Report Date</th>
            <th>Action Date</th>
            <th>Place</th>
            <th>What</th>
            <th>Meta</th>
            <th>URL</th>
            <th>Actions</th>
            <th>Commit</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.newsdate}</td>
              <td>{item.reportdate}</td>
              <td>{item.actiondate}</td>
              <td>{item.place}</td>
              <td>{item.what}</td>
              <td>{item.meta}</td>
              <td>
                <a href={item.url} target="_blank" rel="noreferrer">Link</a>
              </td>
              <td>
                <button onClick={() => handleEdit(item)} title="Edit">✏️</button>
                <button onClick={() => handleDelete(item.id)} title="Delete" style={{ marginLeft: '6px' }}>🗑️</button>
              </td>
              <td>
                {item.sha ? (
                  <a
                    href={`https://github.com/ibeshesumne/energynews/commit/${item.sha}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                ) : (
                  '-'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Server-side data fetching
export async function getServerSideProps(context) {
  const { req } = context;
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const baseUrl = `${protocol}://${req.headers.host}`;

  const res = await fetch(`${baseUrl}/api/entries`);
  const data = await res.json();
  return { props: { data } };
}
