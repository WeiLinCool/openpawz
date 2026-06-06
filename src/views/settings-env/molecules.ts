// Settings: Environment — DOM rendering + IPC

import { pawEngine } from '../../engine';
import { showToast } from '../../components/toast';
import { isConnected } from '../../state/connection';
import { esc, textInput } from '../settings-config';
import { $ } from '../../components/helpers';

// ── Render ──────────────────────────────────────────────────────────────────

export async function loadEnvSettings() {
  if (!isConnected()) return;
  const container = $('settings-env-content');
  if (!container) return;
  container.innerHTML = '<p style="color:var(--text-muted)">加载中…</p>';

  try {
    container.innerHTML = '';

    // ── System Environment ───────────────────────────────────────────────
    const sysSection = document.createElement('div');
    sysSection.style.cssText = 'margin-bottom:16px';
    sysSection.innerHTML = `
      <h3 class="settings-subsection-title">系统环境</h3>
      <p class="form-hint" style="margin:0 0 8px;font-size:12px;color:var(--text-muted)">
        Paw 会自动继承系统环境变量。
        你可以在 shell 配置文件（<code>~/.bashrc</code>、<code>~/.zshrc</code> 等）
        或桌面环境中设置它们。更改会在应用重启后生效。
      </p>
    `;
    container.appendChild(sysSection);

    // ── Provider API Keys ────────────────────────────────────────────────
    const provSection = document.createElement('div');
    provSection.innerHTML =
      '<h3 class="settings-subsection-title" style="margin-top:16px">提供商 API 密钥</h3>';
    provSection.innerHTML +=
      '<p class="form-hint" style="margin:0 0 8px;font-size:12px;color:var(--text-muted)">API 密钥会保存在引擎配置中，并在静态存储时加密。请在“设置 → 高级”中管理提供商。</p>';

    const config = await pawEngine.getConfig();
    if (config.providers.length === 0) {
      const empty = document.createElement('p');
      empty.style.cssText = 'color:var(--text-muted);font-size:13px;padding:8px 0';
        empty.textContent =
        '当前还没有配置提供商。请前往“设置 → 高级”添加提供商。';
      provSection.appendChild(empty);
    } else {
      for (const prov of config.providers) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:6px';

        const label = document.createElement('span');
        label.style.cssText = 'min-width:100px;font-weight:600;font-size:13px';
        label.textContent = prov.kind.charAt(0).toUpperCase() + prov.kind.slice(1);
        row.appendChild(label);

        const keyInp = textInput(
          prov.api_key,
          prov.kind === 'ollama' ? '(not required)' : 'sk-...',
          'password',
        );
        keyInp.style.cssText = 'flex:1;font-family:var(--font-mono);font-size:12px';
        row.appendChild(keyInp);

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-sm btn-primary';
        saveBtn.textContent = '保存';
        saveBtn.addEventListener('click', async () => {
          try {
            const updated = { ...prov, api_key: keyInp.value };
            await pawEngine.upsertProvider(updated);
            showToast(`${prov.kind} API 密钥已更新`, 'success');
          } catch (e) {
            showToast(`失败：${e instanceof Error ? e.message : e}`, 'error');
          }
        });
        row.appendChild(saveBtn);

        provSection.appendChild(row);
      }
    }
    container.appendChild(provSection);

    // ── Skill Credentials ────────────────────────────────────────────────
    const skillSection = document.createElement('div');
    skillSection.innerHTML =
      '<h3 class="settings-subsection-title" style="margin-top:20px">技能凭据</h3>';
    skillSection.innerHTML +=
      '<p class="form-hint" style="margin:0 0 8px;font-size:12px;color:var(--text-muted)">已启用技能的凭据（邮件、Slack、GitHub 等）会在“技能”设置中管理，并加密存储在本地保险库中。</p>';

    try {
      const skills = await pawEngine.skillsList();
      const configured = skills.filter((s) => s.configured_credentials.length > 0);

      if (configured.length === 0) {
        const hint = document.createElement('p');
        hint.style.cssText = 'color:var(--text-muted);font-size:13px;padding:4px 0';
          hint.textContent =
          '当前还没有配置技能凭据。请先启用技能，然后在“技能”页面添加凭据。';
        skillSection.appendChild(hint);
      } else {
        for (const skill of configured) {
          const row = document.createElement('div');
          row.style.cssText =
            'display:flex;gap:8px;align-items:center;margin-bottom:4px;padding:6px 0;border-bottom:1px solid var(--border-light, rgba(255,255,255,0.06))';
          row.innerHTML = `
            <span style="font-size:16px">${esc(skill.icon)}</span>
            <span style="font-weight:600;font-size:13px;min-width:80px">${esc(skill.name)}</span>
            <span style="color:var(--text-muted);font-size:12px">已存储 ${skill.configured_credentials.length} 个凭据</span>
            ${skill.missing_credentials.length > 0 ? `<span style="color:var(--warning);font-size:11px">缺少：${skill.missing_credentials.join(', ')}</span>` : '<span style="color:var(--success);font-size:11px">已就绪</span>'}
          `;
          skillSection.appendChild(row);
        }
      }
    } catch {
      // Skills may not be available
      const hint = document.createElement('p');
      hint.style.cssText = 'color:var(--text-muted);font-size:12px;padding:4px 0';
      hint.textContent = '无法加载技能凭据。';
      skillSection.appendChild(hint);
    }

    container.appendChild(skillSection);

    // ── Common Environment Variables Guide ────────────────────────────────
    const guideSection = document.createElement('div');
    guideSection.innerHTML = `
      <h3 class="settings-subsection-title" style="margin-top:20px">常见环境变量</h3>
      <p class="form-hint" style="margin:0 0 8px;font-size:12px;color:var(--text-muted)">
        如有需要，可在 shell 配置文件中设置这些变量。Paw 会自动读取。
      </p>
      <div style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);line-height:1.8">
        <div><code>OPENAI_API_KEY</code> — OpenAI API 密钥（也可通过提供商配置）</div>
        <div><code>ANTHROPIC_API_KEY</code> — Anthropic API 密钥</div>
        <div><code>GOOGLE_API_KEY</code> — Google AI API 密钥</div>
        <div><code>OLLAMA_HOST</code> — Ollama 服务器地址（默认：http://localhost:11434）</div>
        <div><code>GITHUB_TOKEN</code> — 用于 GitHub 技能的 GitHub 个人访问令牌</div>
        <div><code>SLACK_TOKEN</code> — 用于 Slack 技能的 Slack 机器人令牌</div>
        <div><code>PATH</code> — 系统 PATH（供 git、docker 等工具使用）</div>
      </div>
    `;
    container.appendChild(guideSection);
  } catch (e) {
    container.innerHTML = `<p style="color:var(--danger)">加载失败：${esc(String(e))}</p>`;
  }
}
