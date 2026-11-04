// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
export function createStudentView() {
  return {
    renderIdentity({ me, devices, sessions } = {}) {
      const root = document.createElement('div');
      root.className = 'student-identity';

      const DEVICE_LABELS = {
        compliant: '보안 기준 충족(compliant)',
        noncompliant: '보안 기준 미충족(noncompliant)',
        unknown: '확인 불가(unknown)',
      };
      const SESSION_LABELS = {
        active: '활성(active)',
        expired: '만료(expired)',
        revoked: '철회됨(revoked)',
        unknown: '확인 불가(unknown)',
      };
      const MODE_LABELS = {
        demo: '예제 자료',
        disconnected: '연결 없음',
        unknown: '확인 불가',
      };

      const appendMode = (target, mode) => {
        if (!mode || !Object.hasOwn(MODE_LABELS, mode)) return;
        const note = document.createElement('p');
        note.className = `student-mode student-mode-${mode}`;
        note.textContent = MODE_LABELS[mode];
        target.append(note);
      };

      const message = (text, kind) => {
        const p = document.createElement('p');
        p.className = `student-state student-state-${kind}`;
        p.textContent = text;
        return p;
      };

      const row = (label, value) => {
        const dl = document.createElement('dl');
        dl.className = 'student-identity-row';
        const dt = document.createElement('dt');
        dt.textContent = label;
        const dd = document.createElement('dd');
        dd.textContent = value;
        dl.append(dt, dd);
        return dl;
      };

      const meState = me && me.status;
      const meMode = me && me.mode;
      // devices/sessions 도 같은 세대의 응답이므로, me 가 loading/error 여도 mode 안내를 위해 참고한다.
      const anyMode = [me, devices, sessions]
        .map((r) => r && r.mode)
        .find((m) => m && Object.hasOwn(MODE_LABELS, m)) || meMode;

      // devices/sessions 를 각자의 상태(loading/ok/error)에 따라 별도 블록으로 그린다.
      // me 의 상태와 무관하게 항상 표시하여, me 가 ok 여도 목록 오류가 드러나게 한다.
      const renderListSection = (title, resource, describe, emptyText) => {
        const section = document.createElement('section');
        section.className = 'student-identity-section';
        const h = document.createElement('p');
        h.textContent = title;
        section.append(h);

        const state = resource && resource.status;
        const mode = resource && resource.mode;
        if (!resource || state === 'loading') {
          section.append(message(`${title}: 불러오는 중`, 'loading'));
          appendMode(section, mode);
          return section;
        }
        if (state === 'error') {
          const detail = resource.error && resource.error.message ? resource.error.message : '서버에 연결하지 못했습니다.';
          section.append(
            message(`${title}: 연결 실패: ${detail}`, 'error'),
            message(`${title}: 확인 불가`, 'error'),
          );
          appendMode(section, mode);
          return section;
        }
        if (state === 'ok') {
          const list = Array.isArray(resource.data) ? resource.data : [];
          if (list.length === 0) {
            section.append(message(`${title}: ${emptyText}`, 'empty'));
          } else {
            const ul = document.createElement('ul');
            ul.className = 'student-identity-list';
            for (const item of list) {
              const li = document.createElement('li');
              li.textContent = describe(item);
              ul.append(li);
            }
            section.append(ul);
          }
          appendMode(section, mode);
          return section;
        }
        section.append(message(`${title}: 확인 불가`, 'error'));
        appendMode(section, mode);
        return section;
      };

      if (!me || meState === 'loading') {
        root.append(message('불러오는 중', 'loading'));
        appendMode(root, anyMode);
        root.append(
          renderListSection(
            '기기',
            devices,
            (item) => {
              const label = item.label || item.id || '확인 불가';
              const status = Object.hasOwn(DEVICE_LABELS, item.status) ? DEVICE_LABELS[item.status] : '확인 불가(unknown)';
              return `${label} · ${status}`;
            },
            '표시할 기기가 없습니다.',
          ),
          renderListSection(
            '세션',
            sessions,
            (item) => {
              const status = Object.hasOwn(SESSION_LABELS, item.status) ? SESSION_LABELS[item.status] : '확인 불가(unknown)';
              return `${item.id || '확인 불가'} · ${status}`;
            },
            '표시할 세션이 없습니다.',
          ),
        );
        return root;
      }

      if (meState === 'error') {
        const detail = me.error && me.error.message ? me.error.message : '서버에 연결하지 못했습니다.';
        root.append(
          message(`연결 실패: ${detail}`, 'error'),
          message('확인 불가: 현재 로그인 정보를 불러올 수 없습니다.', 'error'),
        );
        appendMode(root, anyMode);
        root.append(
          renderListSection(
            '기기',
            devices,
            (item) => {
              const label = item.label || item.id || '확인 불가';
              const status = Object.hasOwn(DEVICE_LABELS, item.status) ? DEVICE_LABELS[item.status] : '확인 불가(unknown)';
              return `${label} · ${status}`;
            },
            '표시할 기기가 없습니다.',
          ),
          renderListSection(
            '세션',
            sessions,
            (item) => {
              const status = Object.hasOwn(SESSION_LABELS, item.status) ? SESSION_LABELS[item.status] : '확인 불가(unknown)';
              return `${item.id || '확인 불가'} · ${status}`;
            },
            '표시할 세션이 없습니다.',
          ),
        );
        return root;
      }

      if (meState === 'ok') {
        const data = me.data || {};
        const user = data.user || {};
        const device = data.device || {};
        const session = data.session || {};
        const userLabel = user.label || user.id || '확인 불가';
        const deviceLabel = device.label || device.id || '확인 불가';
        const deviceStatus = Object.hasOwn(DEVICE_LABELS, device.status) ? DEVICE_LABELS[device.status] : '확인 불가(unknown)';
        const sessionStatus = Object.hasOwn(SESSION_LABELS, session.status) ? SESSION_LABELS[session.status] : '확인 불가(unknown)';

        root.append(
          row('사용자', userLabel),
          row('기기', `${deviceLabel} · ${deviceStatus}`),
          row('세션', `${session.id || '확인 불가'} · ${sessionStatus}`),
        );

        root.append(
          renderListSection(
            '기기 목록',
            devices,
            (item) => {
              const label = item.label || item.id || '확인 불가';
              const status = Object.hasOwn(DEVICE_LABELS, item.status) ? DEVICE_LABELS[item.status] : '확인 불가(unknown)';
              return `${label} · ${status}`;
            },
            '표시할 기기가 없습니다.',
          ),
          renderListSection(
            '세션 목록',
            sessions,
            (item) => {
              const status = Object.hasOwn(SESSION_LABELS, item.status) ? SESSION_LABELS[item.status] : '확인 불가(unknown)';
              return `${item.id || '확인 불가'} · ${status}`;
            },
            '표시할 세션이 없습니다.',
          ),
        );

        appendMode(root, anyMode);
        return root;
      }

      // status 가 loading/ok/error 가 아닌 경우(예: idle)도 확인 불가로 남긴다.
      root.append(message('확인 불가', 'error'));
      appendMode(root, anyMode);
      root.append(
        renderListSection(
          '기기',
          devices,
          (item) => {
            const label = item.label || item.id || '확인 불가';
            const status = Object.hasOwn(DEVICE_LABELS, item.status) ? DEVICE_LABELS[item.status] : '확인 불가(unknown)';
            return `${label} · ${status}`;
          },
          '표시할 기기가 없습니다.',
        ),
        renderListSection(
          '세션',
          sessions,
          (item) => {
            const status = Object.hasOwn(SESSION_LABELS, item.status) ? SESSION_LABELS[item.status] : '확인 불가(unknown)';
            return `${item.id || '확인 불가'} · ${status}`;
          },
          '표시할 세션이 없습니다.',
        ),
      );
      return root;
    },
    renderDecision({ status, mode, data, error, appId } = {}) {
      const root = document.createElement('div');
      root.className = 'student-decision';

      const DECISION_LABELS = {
        allow: '접근 허용(allow)',
        deny: '접근 거부(deny)',
        challenge: '추가 확인 필요(challenge)',
        unknown: '확인 불가(unknown)',
      };
      const MODE_LABELS = {
        connected: '연결됨',
        demo: '예제 데이터(demo) · 실제 연결 아님',
        disconnected: '연결 없음',
        unknown: '연결 상태 확인 불가',
      };

      const message = (text, kind) => {
        const p = document.createElement('p');
        p.className = `student-state student-state-${kind}`;
        p.textContent = text;
        return p;
      };

      const row = (label, value) => {
        const dl = document.createElement('dl');
        dl.className = 'student-decision-row';
        const dt = document.createElement('dt');
        dt.textContent = label;
        const dd = document.createElement('dd');
        dd.textContent = value;
        dl.append(dt, dd);
        return dl;
      };

      const appendMode = (target, m) => {
        if (!m || !Object.hasOwn(MODE_LABELS, m)) return;
        const note = document.createElement('p');
        note.className = `student-mode student-mode-${m}`;
        note.textContent = MODE_LABELS[m];
        target.append(note);
      };

      if (status === 'idle' || status == null) {
        root.append(message('앱을 골라 접속을 요청하세요.', 'idle'));
        appendMode(root, mode);
        return root;
      }

      if (status === 'loading') {
        root.append(message('판정 확인 중', 'loading'));
        appendMode(root, mode);
        return root;
      }

      if (status === 'error') {
        const detail = error && typeof error.message === 'string' && error.message
          ? error.message
          : '서버에 연결하지 못했습니다.';
        root.append(
          message(`요청 실패: ${detail}`, 'error'),
          message('요청 실패는 접근 거부 판정이 아닙니다. 판정을 확인할 수 없습니다(unknown).', 'error'),
        );
        appendMode(root, mode);
        return root;
      }

      if (status === 'ok') {
        const payload = data || {};
        const raw = payload.decision;
        const isKnown = typeof raw === 'string' && Object.hasOwn(DECISION_LABELS, raw);
        const shownCode = isKnown ? raw : 'unknown';
        const rawText = typeof raw === 'string' && raw.length > 0 ? raw : 'unknown';
        const label = DECISION_LABELS[shownCode];
        const shownAppId = payload.appId || appId || '확인 불가';
        const reason = typeof payload.reason === 'string' && payload.reason.length > 0
          ? payload.reason
          : '사유 정보 없음';
        const checkedAt = typeof payload.checkedAt === 'string' && payload.checkedAt.length > 0
          ? payload.checkedAt
          : '시각 정보 없음';

        if (shownCode === 'allow') {
          root.append(message(`판정: ${label}`, 'ok'));
          root.append(message('정책상 접근 허용이며, 실제 앱 접속 성공을 보장하지 않습니다.', 'ok'));
        } else if (shownCode === 'deny') {
          root.append(message(`판정: ${label}`, 'error'));
        } else if (shownCode === 'challenge') {
          root.append(
            message(`판정: ${label}`, 'loading'),
            message('추가 인증 또는 확인이 필요합니다. 이 앱이 인증 절차를 대신 수행하지는 않습니다.', 'loading'),
          );
        } else {
          const rawNote = isKnown
            ? `확인 불가(unknown)`
            : `확인 불가(unknown) · 서버가 보낸 원래 값: ${rawText}`;
          root.append(
            message(rawNote, 'error'),
            message('허용되지 않음. 판정을 확인할 수 없습니다.', 'error'),
          );
        }

        root.append(
          row('앱 ID', shownAppId),
          row('판정 이유', reason),
          row('판정 시각', checkedAt),
        );
        appendMode(root, mode);
        return root;
      }

      // status 가 idle/loading/ok/error 가 아닌 경우
      root.append(
        message('확인 불가(unknown) · 판정을 확인할 수 없습니다.', 'error'),
        message('허용되지 않음.', 'error'),
      );
      appendMode(root, mode);
      return root;
    },
    renderEvents({ status, mode, data, error } = {}) {
      const root = document.createElement('div');
      root.className = 'student-events';

      const KIND_LABELS = {
        access: '접속(access)',
        xdr: 'XDR 경보(xdr)',
      };
      const ACCESS_LABELS = {
        allowed: '허용됨(allowed)',
        denied: '거부됨(denied)',
        unknown: '확인 불가(unknown)',
      };
      const SESSION_LABELS = {
        active: '활성(active)',
        expired: '만료(expired)',
        revoked: '철회됨(revoked)',
        unknown: '확인 불가(unknown)',
      };
      const DEVICE_LABELS = {
        compliant: '보안 기준 충족(compliant)',
        noncompliant: '보안 기준 미충족(noncompliant)',
        unknown: '확인 불가(unknown)',
      };
      const MODE_LABELS = {
        connected: '연결됨',
        demo: '예제 데이터(demo) · 실제 연결 아님',
        disconnected: '연결 없음',
        unknown: '연결 상태 확인 불가',
      };

      const message = (text, kind) => {
        const p = document.createElement('p');
        p.className = `student-state student-state-${kind}`;
        p.textContent = text;
        return p;
      };

      const appendMode = (target, m) => {
        if (!m || !Object.hasOwn(MODE_LABELS, m)) return;
        const note = document.createElement('p');
        note.className = `student-mode student-mode-${m}`;
        note.textContent = MODE_LABELS[m];
        target.append(note);
      };

      const formatAt = (value) => {
        if (typeof value !== 'string' || value.length === 0) return '시각 정보 없음';
        const ms = Date.parse(value);
        return Number.isFinite(ms) ? `${new Date(ms).toLocaleString('ko-KR')} (${value})` : value;
      };

      const kindLabel = (kind) => Object.hasOwn(KIND_LABELS, kind) ? KIND_LABELS[kind] : '종류 확인 불가';
      const appLabel = (appId) => (typeof appId === 'string' && appId.length > 0) ? appId : '앱을 확인할 수 없음';
      const accessLabel = (v) => Object.hasOwn(ACCESS_LABELS, v) ? ACCESS_LABELS[v] : '확인 불가(unknown)';
      const sessionLabel = (v) => Object.hasOwn(SESSION_LABELS, v) ? SESSION_LABELS[v] : '확인 불가(unknown)';
      const deviceLabel = (v) => Object.hasOwn(DEVICE_LABELS, v) ? DEVICE_LABELS[v] : '확인 불가(unknown)';

      if (status === 'loading') {
        root.append(message('기록을 불러오는 중', 'loading'));
        appendMode(root, mode);
        return root;
      }

      if (status === 'error') {
        const detail = error && typeof error.message === 'string' && error.message
          ? error.message
          : '서버에 연결하지 못했습니다.';
        root.append(
          message(`기록을 불러오지 못했습니다: ${detail}`, 'error'),
          message('이 화면은 빈 목록이 아닙니다. 기록을 불러오지 못해 확인할 수 없습니다.', 'error'),
        );
        appendMode(root, mode);
        return root;
      }

      if (status !== 'ok') {
        root.append(
          message('기록을 불러오지 못했습니다: 응답 상태를 확인할 수 없습니다.', 'error'),
          message('이 화면은 빈 목록이 아닙니다. 기록을 확인할 수 없습니다.', 'error'),
        );
        appendMode(root, mode);
        return root;
      }

      const list = Array.isArray(data) ? data.slice() : [];

      if (list.length === 0) {
        root.append(message('표시할 기록이 없습니다.', 'empty'));
        appendMode(root, mode);
        return root;
      }

      const sorted = list.slice().sort((a, b) => {
        const ta = Date.parse(a && a.at);
        const tb = Date.parse(b && b.at);
        const va = Number.isFinite(ta) ? ta : -Infinity;
        const vb = Number.isFinite(tb) ? tb : -Infinity;
        return vb - va;
      });

      const kindValues = ['all', ...new Set(sorted.map((e) => e.kind).filter((v) => typeof v === 'string' && v.length > 0))];
      const appValues = ['all', ...new Set(sorted.map((e) => e.appId).filter((v) => typeof v === 'string' && v.length > 0))];
      const accessValues = ['all', ...new Set(sorted.map((e) => e && e.state && e.state.access).filter((v) => typeof v === 'string' && v.length > 0))];

      const filterState = { kind: 'all', app: 'all', access: 'all' };

      const buildSelect = ({ id, labelText, values, onChange, describe }) => {
        const wrap = document.createElement('div');
        wrap.className = 'student-events-filter';
        const label = document.createElement('label');
        label.setAttribute('for', id);
        label.textContent = labelText;
        const select = document.createElement('select');
        select.id = id;
        select.name = id;
        for (const value of values) {
          const opt = document.createElement('option');
          opt.value = value;
          opt.textContent = describe(value);
          select.append(opt);
        }
        select.addEventListener('change', () => {
          onChange(select.value);
        });
        wrap.append(label, select);
        return wrap;
      };

      const describeKind = (v) => v === 'all' ? '전체' : (Object.hasOwn(KIND_LABELS, v) ? KIND_LABELS[v] : v);
      const describeApp = (v) => v === 'all' ? '전체' : v;
      const describeAccess = (v) => v === 'all' ? '전체' : (Object.hasOwn(ACCESS_LABELS, v) ? ACCESS_LABELS[v] : v);

      const listEl = document.createElement('ul');
      listEl.className = 'student-events-list';

      const countEl = document.createElement('p');
      countEl.className = 'student-events-count';

      const detailHost = document.createElement('div');
      detailHost.className = 'student-events-detail-host';

      let selectedId = null;

      const renderDetail = (event) => {
        detailHost.replaceChildren();
        const state = event && event.state ? event.state : {};
        const box = document.createElement('section');
        box.className = 'student-events-detail';
        box.setAttribute('data-student-event-detail', String(event.id));

        const h = document.createElement('p');
        h.textContent = `${event.id} 상세`;
        box.append(h);

        const dl = document.createElement('dl');
        dl.className = 'student-events-detail-kv';
        const add = (labelText, valueText) => {
          const dt = document.createElement('dt');
          dt.textContent = labelText;
          const dd = document.createElement('dd');
          dd.textContent = valueText;
          dl.append(dt, dd);
        };
        add('사건 ID', String(event.id));
        add('앱(appId)', appLabel(event.appId));
        add('시각', formatAt(event.at));
        add('종류', kindLabel(event.kind));
        box.append(dl);

        const section = (title, node) => {
          const s = document.createElement('section');
          s.className = 'student-events-detail-section';
          const t = document.createElement('p');
          t.textContent = title;
          s.append(t, node);
          box.append(s);
        };

        const evidence = Array.isArray(event.evidence) ? event.evidence : [];
        const evidenceBox = document.createElement('ul');
        if (evidence.length === 0) {
          const li = document.createElement('li');
          li.textContent = '근거 없음';
          evidenceBox.append(li);
        } else {
          for (const ev of evidence) {
            const li = document.createElement('li');
            const idText = ev && typeof ev.id === 'string' ? ev.id : '확인 불가';
            const textText = ev && typeof ev.text === 'string' ? ev.text : '';
            li.textContent = `${idText}: ${textText}`;
            evidenceBox.append(li);
          }
        }
        section('근거(evidence)', evidenceBox);

        const rules = Array.isArray(event.rules) ? event.rules : [];
        const rulesBox = document.createElement('ul');
        if (rules.length === 0) {
          const li = document.createElement('li');
          li.textContent = '규칙 없음';
          rulesBox.append(li);
        } else {
          for (const r of rules) {
            const li = document.createElement('li');
            const idText = r && typeof r.id === 'string' ? r.id : '확인 불가';
            const textText = r && typeof r.text === 'string' ? r.text : '';
            li.textContent = `${idText}: ${textText}`;
            rulesBox.append(li);
          }
        }
        section('규칙(rules)', rulesBox);

        const stateDl = document.createElement('dl');
        stateDl.className = 'student-events-detail-kv';
        const addState = (labelText, valueText) => {
          const dt = document.createElement('dt');
          dt.textContent = labelText;
          const dd = document.createElement('dd');
          dd.textContent = valueText;
          stateDl.append(dt, dd);
        };
        addState('접속 상태(state.access)', accessLabel(state.access));
        addState('세션 상태(state.session)', sessionLabel(state.session));
        addState('기기 상태(state.device)', deviceLabel(state.device));
        section('상태(state)', stateDl);

        // 16단계: 원천이 넘긴 조치가 있을 때만 요청을 보내지 않는 비활성 안내 버튼을 둔다.
        // supportedActions 가 비어 있으면 버튼을 만들지 않는다. 클릭 처리기를 달지 않아 어떤 요청도 보내지 않는다.
        const actions = Array.isArray(event.supportedActions)
          ? event.supportedActions.filter((a) => typeof a === 'string' && a.length > 0)
          : [];
        if (actions.length > 0) {
          const actionBox = document.createElement('div');
          actionBox.className = 'student-events-detail-unsupported';
          actionBox.append(message('아직 지원하지 않는 조치입니다. 조치 실행 연결은 준비 중이며, 이 버튼은 요청을 보내지 않고 실행되지도 않습니다.', 'note'));
          for (const action of actions) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.disabled = true;
            btn.className = 'student-events-detail-unsupported-action';
            btn.textContent = `${action} 미지원`;
            actionBox.append(btn);
          }
          section('조치(supportedActions)', actionBox);
        }

        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'student-events-detail-close';
        close.textContent = '상세 닫기';
        close.addEventListener('click', () => {
          selectedId = null;
          detailHost.replaceChildren();
        });
        box.append(close);
        detailHost.append(box);
      };

      const matches = (event) => {
        if (filterState.kind !== 'all' && event.kind !== filterState.kind) return false;
        if (filterState.app !== 'all' && event.appId !== filterState.app) return false;
        const access = event && event.state ? event.state.access : undefined;
        if (filterState.access !== 'all' && access !== filterState.access) return false;
        return true;
      };

      const paint = () => {
        listEl.replaceChildren();
        detailHost.replaceChildren();
        selectedId = null;
        const visible = sorted.filter(matches);
        countEl.textContent = `표시 ${visible.length}건 / 전체 ${sorted.length}건`;
        if (visible.length === 0) {
          const li = document.createElement('li');
          li.appendChild(message('필터 조건에 맞는 기록이 없습니다.', 'empty'));
          listEl.append(li);
          return;
        }
        for (const event of visible) {
          const li = document.createElement('li');
          li.className = 'student-events-item';
          li.setAttribute('data-student-event-id', String(event.id));

          const head = document.createElement('p');
          head.className = 'student-events-item-head';
          const idEl = document.createElement('span');
          idEl.className = 'student-events-item-id';
          idEl.textContent = `사건 ID ${event.id}`;
          const kindEl = document.createElement('span');
          kindEl.className = 'student-events-item-kind';
          kindEl.textContent = kindLabel(event.kind);
          const timeEl = document.createElement('span');
          timeEl.className = 'student-events-item-time';
          timeEl.textContent = formatAt(event.at);
          head.append(idEl, document.createTextNode(' · '), kindEl, document.createTextNode(' · '), timeEl);

          const appEl = document.createElement('p');
          appEl.className = 'student-events-item-app';
          appEl.textContent = `앱: ${appLabel(event.appId)}`;

          const summaryEl = document.createElement('p');
          summaryEl.className = 'student-events-item-summary';
          summaryEl.textContent = typeof event.summary === 'string' && event.summary.length > 0 ? event.summary : '요약 정보 없음';

          const open = document.createElement('button');
          open.type = 'button';
          open.className = 'student-events-item-open';
          open.textContent = `${event.id} 상세`;
          open.addEventListener('click', () => {
            if (selectedId === event.id) {
              selectedId = null;
              detailHost.replaceChildren();
              return;
            }
            selectedId = event.id;
            renderDetail(event);
          });

          li.append(head, appEl, summaryEl, open);
          listEl.append(li);
        }
      };

      const filters = document.createElement('div');
      filters.className = 'student-events-filters';
      filters.append(
        buildSelect({
          id: 'student-events-filter-kind',
          labelText: '기록 종류',
          values: kindValues,
          describe: describeKind,
          onChange: (v) => { filterState.kind = v; paint(); },
        }),
        buildSelect({
          id: 'student-events-filter-app',
          labelText: '업무 앱',
          values: appValues,
          describe: describeApp,
          onChange: (v) => { filterState.app = v; paint(); },
        }),
        buildSelect({
          id: 'student-events-filter-access',
          labelText: '접속 상태',
          values: accessValues,
          describe: describeAccess,
          onChange: (v) => { filterState.access = v; paint(); },
        }),
      );

      root.append(filters, countEl, listEl, detailHost);
      appendMode(root, mode);
      paint();
      return root;
    },
    renderStatus({ devices, sessions, notifications, diagnostics, mode } = {}) {
      // 이 함수는 입력만으로 화면을 매번 새로 그린다. 이전 실패 안내를 따로 보관하지 않으므로,
      // 사용자가 다시 불러오기를 눌러 성공한 자료가 오면 이전 실패·시간 초과 안내는 남지 않는다.
      // 이 함수는 어떤 요청도 보내지 않으며 자동으로 다시 요청하지 않는다(타이머·재시도 없음).
      const root = document.createElement('div');
      root.className = 'student-status';

      const DEVICE_LABELS = {
        compliant: '보안 기준 충족',
        noncompliant: '보안 기준 미충족 · 점검 필요',
        unknown: '확인 불가',
      };
      const SESSION_LABELS = {
        active: '활성',
        expired: '만료 · 다시 로그인 필요',
        revoked: '회수됨 · 다시 로그인 필요',
        unknown: '확인 불가',
      };
      const RESOURCE_LABELS = {
        me: '로그인 정보',
        apps: '업무 앱',
        events: '보안 기록',
        devices: '기기',
        sessions: '세션',
        access: '접속 판정',
        diagnostics: '도움정보',
        vulnerabilities: '설치 패키지 조회',
      };
      const MODE_LABELS = {
        connected: '연결됨',
        demo: '예제 데이터(demo) · 실제 연결 아님',
        disconnected: '연결 없음',
        unknown: '연결 상태 확인 불가',
      };
      const RETRY_TEXT = '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요. 자동으로 다시 요청하지 않습니다.';

      const message = (text, kind) => {
        const p = document.createElement('p');
        p.className = `student-state student-state-${kind}`;
        p.textContent = text;
        return p;
      };
      const heading = (text) => {
        const h = document.createElement('h3');
        h.className = 'student-status-heading';
        h.textContent = text;
        return h;
      };
      const safeText = (value, fallback = '확인 불가') => (
        typeof value === 'string' && value.length > 0 ? value : fallback
      );
      const isTimeout = (error) => {
        const code = error && typeof error.code === 'string' ? error.code : '';
        const msg = error && typeof error.message === 'string' ? error.message : '';
        return code.includes('TIMEOUT') || msg.includes('시간이 초과') || msg.includes('시간 초과');
      };
      const errorMessages = (title, error) => {
        const detail = safeText(error && error.message, '서버에 연결하지 못했습니다.');
        const code = safeText(error && error.code, 'UNKNOWN');
        const out = [];
        if (isTimeout(error)) {
          out.push(message(`${title} 불러오기 실패(시간 초과): 응답 시간이 초과됐습니다. ${detail} (code: ${code})`, 'error'));
        } else {
          out.push(message(`${title} 불러오기 실패: ${detail} (code: ${code})`, 'error'));
        }
        out.push(message(`빈 목록이 아니라 ${title} 정보를 확인할 수 없는 상태입니다. 연결 상태를 확인하세요.`, 'error'));
        out.push(message(RETRY_TEXT, 'error'));
        return out;
      };

      // 기기·세션 목록: loading / ok(빈 목록 포함) / error 를 서로 다른 문장으로 구분한다.
      const renderList = ({ title, resource, emptyText, describe, attention, note }) => {
        const section = document.createElement('section');
        section.className = 'student-status-section';
        section.append(heading(title));
        if (note) section.append(message(note, 'note'));
        const status = resource && resource.status;
        if (!resource || status === 'loading' || status === 'idle') {
          section.append(message(`${title} 정보를 불러오는 중입니다.`, 'loading'));
          return section;
        }
        if (status === 'error') {
          section.append(...errorMessages(title, resource.error));
          return section;
        }
        if (status !== 'ok') {
          section.append(message(`${title} 응답 상태를 확인할 수 없습니다(확인 불가).`, 'error'), message(RETRY_TEXT, 'error'));
          return section;
        }
        const list = Array.isArray(resource.data) ? resource.data : [];
        if (list.length === 0) {
          section.append(message(emptyText, 'empty'));
          return section;
        }
        const ul = document.createElement('ul');
        ul.className = 'student-status-list';
        for (const item of list) {
          const li = document.createElement('li');
          li.textContent = describe(item || {});
          if (attention(item || {})) {
            li.className = 'student-status-attention';
            li.textContent = `주의: ${li.textContent}`;
          }
          ul.append(li);
        }
        section.append(ul);
        return section;
      };

      root.append(renderList({
        title: '기기',
        resource: devices,
        emptyText: '등록된 기기가 없습니다.',
        note: '내 이름으로 등록되고 회수되지 않은 기기(최대 100개)이며, 지금 쓰는 기기가 맨 앞에 옵니다.',
        describe: (d) => {
          const raw = safeText(d.status, 'unknown');
          const label = Object.hasOwn(DEVICE_LABELS, raw) ? DEVICE_LABELS[raw] : '확인 불가';
          return `${safeText(d.label, safeText(d.id))} · 상태: ${label} (원래 값: ${raw})`;
        },
        attention: (d) => d.status !== 'compliant',
      }));

      root.append(renderList({
        title: '세션',
        resource: sessions,
        emptyText: '현재 연결 없음: 확인된 세션이 없습니다.',
        note: '지금 검증된 연결 하나만 표시합니다. 지난 세션 목록이 아닙니다.',
        describe: (s) => {
          const raw = safeText(s.status, 'unknown');
          const label = Object.hasOwn(SESSION_LABELS, raw) ? SESSION_LABELS[raw] : '확인 불가';
          return `세션 ${safeText(s.id)} · 상태: ${label} (원래 값: ${raw})`;
        },
        attention: (s) => s.status !== 'active',
      }));

      // 알림: 항목마다 resource·code·message 를 글자로 표시한다.
      const noteSection = document.createElement('section');
      noteSection.className = 'student-status-section';
      noteSection.append(heading('알림'));
      const list = Array.isArray(notifications) ? notifications : [];
      if (list.length === 0) {
        noteSection.append(message('주의할 알림이 없습니다.', 'empty'));
      } else {
        const ul = document.createElement('ul');
        ul.className = 'student-status-notifications';
        let hasFailure = false;
        for (const n of list) {
          const resource = safeText(n && n.resource, 'unknown');
          const name = Object.hasOwn(RESOURCE_LABELS, resource) ? RESOURCE_LABELS[resource] : '알 수 없는 자료';
          const code = safeText(n && n.code, 'UNKNOWN');
          const text = safeText(n && n.message, '내용 없음');
          const li = document.createElement('li');
          li.textContent = `[${name}(${resource})] code: ${code} · ${text}`;
          ul.append(li);
          // 기기·세션·기록 상태 알림이 아닌 code 는 자료 조회 실패 알림이다.
          if (!['compliant', 'noncompliant', 'active', 'expired', 'revoked', 'unknown', 'xdr', 'access'].includes(code)) hasFailure = true;
        }
        noteSection.append(ul);
        if (hasFailure) noteSection.append(message(`불러오지 못한 자료가 있습니다. 연결 상태를 확인하세요. ${RETRY_TEXT}`, 'error'));
      }
      root.append(noteSection);

      // 도움정보: 제공 화면이 조회해 넘긴 diagnostics 만 사용한다. 이 코드는 /api/diagnostics 를 호출하지 않는다.
      const diagSection = document.createElement('section');
      diagSection.className = 'student-status-section';
      diagSection.append(heading('도움정보'));
      diagSection.append(message('도움정보는 담당자에게 도움을 요청할 때 쓰도록 복사할 수 있는 연결 점검 정보입니다. 비밀번호·토큰·API 키는 포함하지 않습니다.', 'note'));

      const diagStatus = diagnostics && diagnostics.status;
      let safeDiag = null;
      if (diagStatus === 'ok' && diagnostics.data && typeof diagnostics.data === 'object') {
        const d = diagnostics.data;
        const engine = d.engine && typeof d.engine === 'object' ? d.engine : {};
        // 허용한 6개 필드만 골라 담는다. 그 밖의 값(ai 설정 등)은 화면과 복사 내용에 넣지 않는다.
        safeDiag = {
          requestId: safeText(d.requestId),
          component: safeText(d.component),
          version: safeText(d.version),
          checkedAt: safeText(d.checkedAt),
          'engine.mode': safeText(engine.mode),
          'engine.code': safeText(engine.code),
        };
        const dl = document.createElement('dl');
        dl.className = 'student-status-diagnostics';
        for (const [key, value] of Object.entries(safeDiag)) {
          const dt = document.createElement('dt');
          dt.textContent = key;
          const dd = document.createElement('dd');
          dd.textContent = value;
          dl.append(dt, dd);
        }
        diagSection.append(message('도움정보 점검 결과를 확인했습니다.', 'ok'), dl);
      } else if (diagStatus === 'loading') {
        diagSection.append(message('도움정보를 불러오는 중입니다.', 'loading'));
      } else if (diagStatus === 'error') {
        diagSection.append(...errorMessages('도움정보', diagnostics.error).slice(0, 1));
        diagSection.append(message('도움정보는 위쪽 도움정보 영역의 불러오기 버튼을 직접 눌러 다시 시도하세요.', 'error'));
      } else {
        diagSection.append(message('아직 도움정보를 불러오지 않았습니다. 위쪽 도움정보 영역에서 직접 불러오세요.', 'idle'));
      }

      const copyStatus = message('', 'note');
      copyStatus.setAttribute('role', 'status');
      const copyButton = document.createElement('button');
      copyButton.type = 'button';
      copyButton.className = 'student-status-copy';
      copyButton.textContent = '도움정보 복사';
      copyButton.disabled = !safeDiag;
      if (!safeDiag) copyStatus.textContent = '도움정보를 불러온 뒤에 복사할 수 있습니다.';
      copyButton.addEventListener('click', async () => {
        if (!safeDiag) return;
        const text = Object.entries(safeDiag).map(([k, v]) => `${k}: ${v}`).join('\n');
        try {
          await navigator.clipboard.writeText(text);
          copyStatus.textContent = '도움정보를 클립보드에 복사했습니다. 붙여 넣기 전에 내용을 직접 확인하세요.';
        } catch {
          copyStatus.textContent = `자동 복사를 사용할 수 없습니다. 아래 내용을 직접 선택해 복사하세요.\n${text}`;
        }
      });
      diagSection.append(copyButton, copyStatus);
      root.append(diagSection);

      if (mode && Object.hasOwn(MODE_LABELS, mode)) root.append(message(MODE_LABELS[mode], 'mode'));
      return root;
    },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection({ status, mode, data, error, checkedAt } = {}) {
      // 입력만으로 매번 새로 그린다. 이전 점검 결과·오류를 보관하지 않으므로
      // 다시 점검해 성공하면 이전 오류가, idle 이 오면(계정 연결 재시작 등) 이전 결과가 화면에 남지 않는다.
      // 이 함수는 요청을 보내지 않고 자동으로 다시 점검하지 않는다. explanationAccepted 는 사건 설명 성공으로 쓰지 않는다.
      const root = document.createElement('div');
      root.className = 'student-ai-connection';
      root.setAttribute('data-student-ai-state', typeof status === 'string' ? status : 'unknown');

      const message = (text, kind) => {
        const p = document.createElement('p');
        p.className = `student-state student-state-${kind}`;
        p.textContent = text;
        return p;
      };
      const row = (dl, label, value) => {
        const dt = document.createElement('dt');
        dt.textContent = label;
        const dd = document.createElement('dd');
        dd.textContent = value;
        dl.append(dt, dd);
      };
      const MANUAL_RETRY = '다시 점검은 자동으로 하지 않습니다. 필요하면 「현재 API 연결 점검」 버튼을 직접 누르세요.';
      const NOT_EXPLAINED = '연결만 점검했습니다. 사건 설명은 아직 실행하지 않았습니다. 사건 설명은 보안 기록에서 따로 요청하고 확인하세요.';

      // 안전한 error.code 로 원인을 나눈다. 원문 오류나 열쇠는 쓰지 않는다.
      const CAUSES = [
        { codes: ['ON_AI_PROVISIONING_PENDING', 'ON_AI_AUTHORIZATION_CHANGED', 'AI_REQUEST_UNVERIFIED'],
          title: '권한 준비 중·확인 불가',
          guide: '학생 잘못이 아닙니다. 담당자에게 계정 연결과 앱 이용 권한 확인을 요청하세요.' },
        { codes: ['WB_CLCO_AUTH_REQUIRED'],
          title: '인증 실패',
          guide: '보호 현황에서 계정 연결을 다시 확인하고, 계속되면 담당자에게 확인하세요. Workbench 열쇠나 AI 회사 원본 열쇠를 복사해 붙이지 마세요.' },
        { codes: ['WB_CLCO_ACCESS_BLOCKED'],
          title: '접근 제한',
          guide: '계정 연결을 다시 확인하고 담당자에게 앱 이용 권한을 확인하세요.' },
        { codes: ['WB_CLCO_COHORT_BUDGET_EXHAUSTED', 'WB_CLCO_LIMIT_REACHED'],
          title: '사용량·이용 한도 도달',
          guide: '반 사용량 또는 이용 한도 문제입니다. 담당자에게 확인하세요.' },
        { codes: ['WB_CLCO_SESSION_CLOSED'],
          title: '이용 시간 아님',
          guide: '현재 AI 이용 시간이 아닙니다. 이용 시간을 확인하세요.' },
        { codes: ['WB_CLCO_RATE_LIMITED'],
          title: '요청 제한',
          guide: `요청이 잠시 제한됐습니다. 잠시 뒤 직접 다시 점검하세요.` },
        { codes: ['WB_CLCO_TIMEOUT', 'REQUEST_TIMEOUT', 'ENGINE_TIMEOUT', 'TIMEOUT'],
          title: '시간 초과',
          guide: '응답 시간이 초과됐습니다. 잠시 뒤 직접 다시 점검하세요.' },
        { codes: ['NETWORK_ERROR', 'SERVICE_UNAVAILABLE'],
          title: '네트워크·서버 연결 문제',
          guide: '네트워크 또는 서버 연결을 확인하고 잠시 뒤 직접 다시 점검하세요.' },
        { codes: ['WB_CLCO_CANCELLED', 'CANCELLED', 'REQUEST_CANCELLED'],
          title: '취소됨',
          guide: '점검을 취소했습니다. 이전 점검 결과는 현재 결과가 아닙니다.' },
        { codes: ['ON_AI_MODEL_LIST_EMPTY', 'MODEL_NOT_CONFIGURED'],
          title: '쓸 수 있는 모델 없음',
          guide: '현재 권한으로 쓸 수 있는 AI 모델이 없습니다. 담당자에게 모델 허용 설정 확인을 요청하세요.' },
      ];
      const SAFE_CODE = /^[A-Z0-9_]{1,64}$/;

      if (status === 'idle' || status == null) {
        root.append(
          message('AI 연결 점검 전', 'idle'),
          message('아직 점검하지 않았습니다. 이전 점검 결과는 표시하지 않습니다. 연결 완료 뒤 「현재 API 연결 점검」을 직접 누르세요.', 'idle'),
        );
        return root;
      }

      if (status === 'loading') {
        root.append(
          message('AI 연결 점검 중', 'loading'),
          message('점검을 멈추려면 「취소」를 누르세요. 아직 결과가 아닙니다.', 'loading'),
        );
        return root;
      }

      if (status === 'error') {
        const rawCode = error && typeof error.code === 'string' ? error.code : '';
        const code = SAFE_CODE.test(rawCode) ? rawCode : 'UNKNOWN';
        const msg = error && typeof error.message === 'string' && error.message.length > 0 && error.message.length <= 300
          ? error.message
          : 'AI 연결을 확인할 수 없습니다.';
        const cause = CAUSES.find((c) => c.codes.includes(code));
        root.append(
          message(cause && cause.title === '취소됨'
            ? 'AI 연결 점검 취소됨'
            : `AI 연결 점검 실패 · ${cause ? cause.title : '확인 불가'}`, 'error'),
          message(`오류 코드: ${code} · ${msg}`, 'error'),
          message(cause ? cause.guide : '원인을 확인할 수 없습니다. 담당자에게 오류 코드를 알려 확인하세요.', 'error'),
          message('연결 점검에 성공하지 않았습니다. 사건 설명도 실행하지 않았습니다.', 'error'),
          message(MANUAL_RETRY, 'note'),
        );
        return root;
      }

      if (status === 'ok' && data && data.transportChecked === true) {
        const audience = data.audienceAuthorization;
        const audienceText = audience === 'verified'
          ? '앱 권한 확인 후 점검(verified)'
          : audience === 'test'
            ? '시험 연결 점검(test)'
            : '점검 종류 확인 불가';
        root.append(message(`AI 연결 점검 결과: ${audienceText}`, 'ok'));
        if (audience === 'test') {
          root.append(message('시험 연결만 확인했습니다. 실제 앱 이용 권한(게이트 수용)은 아직 확인되지 않았습니다.', 'note'));
        } else if (audience === 'verified') {
          root.append(message('점검 시각 기준으로 앱 이용 권한 확인과 모델 응답을 확인했습니다.', 'note'));
        }
        const dl = document.createElement('dl');
        dl.className = 'student-ai-connection-kv';
        row(dl, '응답 모델 수(modelCount)', Number.isInteger(data.modelCount) ? `${data.modelCount}개` : '확인 불가');
        row(dl, '점검 시각(checkedAt)', typeof checkedAt === 'string' && checkedAt ? checkedAt : '시각 정보 없음');
        const helpCode = data.help && typeof data.help.code === 'string' && SAFE_CODE.test(data.help.code) ? data.help.code : '확인 불가';
        row(dl, '점검 코드', helpCode);
        root.append(dl);
        if (mode === 'demo') root.append(message('예제 응답(demo) · 실제 게이트 연결 아님', 'note'));
        root.append(message(NOT_EXPLAINED, 'note'), message(MANUAL_RETRY, 'note'));
        return root;
      }

      root.append(
        message('AI 연결 상태 확인 불가', 'error'),
        message('점검 결과 형식을 확인할 수 없어 성공으로 표시하지 않습니다.', 'error'),
        message(MANUAL_RETRY, 'note'),
      );
      return root;
    },
    renderExplanation({ event, explanation, checkedAt } = {}) {
      // 18단계에서 넓힐 기초 표시. 요청을 보내지 않고 제안을 실행하지 않는다.
      const root = document.createElement('div');
      root.className = 'student-explanation';
      const message = (text, kind) => {
        const p = document.createElement('p');
        p.className = `student-state student-state-${kind}`;
        p.textContent = text;
        return p;
      };
      const status = explanation && explanation.status;
      const eventId = event && typeof event.id === 'string' ? event.id : null;

      if (!explanation || status === 'idle' || !event) {
        root.append(message('AI 설명 요청 전입니다. 보안 기록에서 사건을 골라 설명을 직접 요청하세요.', 'idle'));
        return root;
      }
      if (status === 'loading') {
        root.append(message(`사건 ${eventId || '확인 불가'}의 AI 설명을 요청하는 중입니다.`, 'loading'));
        return root;
      }
      if (status === 'ok' && eventId && explanation.data && typeof explanation.data.summary === 'string') {
        root.setAttribute('data-student-explanation-event', eventId);
        const dl = document.createElement('dl');
        dl.className = 'student-explanation-kv';
        const add = (label, value) => {
          const dt = document.createElement('dt');
          dt.textContent = label;
          const dd = document.createElement('dd');
          dd.textContent = value;
          dl.append(dt, dd);
        };
        add('사건 ID', eventId);
        add('AI 설명 요약', explanation.data.summary);
        add('확인 시각', typeof checkedAt === 'string' && checkedAt ? checkedAt : '시각 정보 없음');
        root.append(dl, message('AI 설명은 참고용이며, 제안된 조치는 실행되지 않았습니다.', 'note'));
        return root;
      }
      // 실패(또는 형식 확인 불가): data-student-explanation-event 를 붙이지 않는다.
      const err = explanation.error || {};
      const code = typeof err.code === 'string' && /^[A-Z0-9_]{1,64}$/.test(err.code) ? err.code : 'UNKNOWN';
      const msg = typeof err.message === 'string' && err.message ? err.message : 'AI 설명을 확인할 수 없습니다.';
      root.append(
        message(`AI 설명 실패 · 오류 코드: ${code} · ${msg}`, 'error'),
        message('보안 기록은 그대로 유지됩니다. AI 설명만 받지 못했습니다.', 'note'),
      );
      return root;
    },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}