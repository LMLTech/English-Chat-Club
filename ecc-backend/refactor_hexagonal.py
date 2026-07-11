import os

repos = [
    ("ChatMessageRepository", "ChatMessage", "Long"),
    ("EventRepository", "Event", "Long"),
    ("EventRegistrationRepository", "EventRegistration", "Long"),
    ("SessionSummaryRepository", "SessionSummary", "Long"),
    ("UserWarningRepository", "UserWarning", "Long"),
    ("VocabularyHighlightRepository", "VocabularyHighlight", "Long"),
    ("SessionReviewRepository", "SessionReview", "Long"),
    ("UserVoiceRecordRepository", "UserVoiceRecord", "Long")
]

base_path = r"e:\HOC_TAP_UTH\Hoc_Ky_2_Nam_3\Do_An_Thuc_Te_CNPM\English-Chat-Club\ecc-backend\ecc-session-module\src\main\java\com\ecc\session"
port_path = os.path.join(base_path, "application", "port", "out")
adapter_path = os.path.join(base_path, "infrastructure", "adapter")

os.makedirs(port_path, exist_ok=True)
os.makedirs(adapter_path, exist_ok=True)

for repo, entity, id_type in repos:
    port_name = f"{repo}Port"
    adapter_name = f"{repo}Adapter"
    
    # 1. Create Port
    port_content = f"""package com.ecc.session.application.port.out;

import com.ecc.session.domain.model.{entity};
import java.util.Optional;
import java.util.List;

public interface {port_name} {{
    {entity} save({entity} entity);
    Optional<{entity}> findById({id_type} id);
    List<{entity}> findAll();
    void deleteById({id_type} id);
    void delete({entity} entity);
}}
"""
    with open(os.path.join(port_path, f"{port_name}.java"), "w", encoding="utf-8") as f:
        f.write(port_content)
        
    # 2. Create Adapter
    adapter_content = f"""package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.{port_name};
import com.ecc.session.domain.model.{entity};
import com.ecc.session.infrastructure.repository.{repo};
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.List;

@Component
@RequiredArgsConstructor
public class {adapter_name} implements {port_name} {{

    private final {repo} repository;

    @Override
    public {entity} save({entity} entity) {{
        return repository.save(entity);
    }}

    @Override
    public Optional<{entity}> findById({id_type} id) {{
        return repository.findById(id);
    }}

    @Override
    public List<{entity}> findAll() {{
        return repository.findAll();
    }}

    @Override
    public void deleteById({id_type} id) {{
        repository.deleteById(id);
    }}
    
    @Override
    public void delete({entity} entity) {{
        repository.delete(entity);
    }}
}}
"""
    with open(os.path.join(adapter_path, f"{adapter_name}.java"), "w", encoding="utf-8") as f:
        f.write(adapter_content)

print("Generated all Ports and Adapters!")
