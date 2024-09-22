const useJobStatus = (initialBroken) => {
    const [binaryBroken, setBinaryBroken] = useState(initialBroken?.Binary || false);
    const [imageBroken, setImageBroken] = useState(initialBroken?.Image || false);
    const [recipeBroken, setRecipeBroken] = useState(initialBroken?.Recipe || false);
    const [dockerfileBroken, setDockerfileBroken] = useState(initialBroken?.Dockerfile || false);
    const [ciBroken, setCiBroken] = useState(initialBroken?.CI || false);
    const [isEditing, setIsEditing] = useState(false);
  
    const handleCheckboxChange = (setter) => {
      if (isEditing) {
        setter(prev => !prev); // Toggle the checkbox value
      }
    };
  
    const handleSubmit = (jobId, onSuccess) => {
      const brokenStatus = {
        CI: ciBroken,
        Recipe: recipeBroken,
        Dockerfile: dockerfileBroken,
        Image: imageBroken,
        Binary: binaryBroken
      };
  
      fetch(`http://localhost:4000/jobs/update-broken/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Broken: brokenStatus }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Update successful:', data);
        onSuccess();
      })
      .catch(error => console.error('Error updating job:', error));
    };
  
    return {
      binaryBroken,
      setBinaryBroken,
      imageBroken,
      setImageBroken,
      recipeBroken,
      setRecipeBroken,
      dockerfileBroken,
      setDockerfileBroken,
      ciBroken,
      setCiBroken,
      isEditing,
      setIsEditing,
      handleCheckboxChange,
      handleSubmit
    };
  };
  