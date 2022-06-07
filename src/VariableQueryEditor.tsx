import React, { useState } from 'react';

interface VariableQueryProps {
  query: string;
  onChange: (query: string, definition: string) => void;
}

export const VariableQueryEditor: React.FC<VariableQueryProps> = ({ onChange, query }) => {
  const [state, setState] = useState(query);

  const saveQuery = () => {
    onChange(state, `${state}`);
  };

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => setState(event.currentTarget.value);

  return (
    <>
      <div className="gf-form">
        <span className="gf-form-label width-10">Query</span>
        <input name="rawQuery" className="gf-form-input" onBlur={saveQuery} onChange={handleChange} value={state} />
      </div>
    </>
  );
};
