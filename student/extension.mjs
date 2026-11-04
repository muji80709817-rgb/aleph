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
    renderVulnerabilities({ status, mode, data, error } = {}) {
      // 입력만으로 매번 새로 그린다. loading·error·idle 화면에는 표를 그리지 않으므로
      // 이전 조회 표가 현재 결과처럼 남지 않는다. 다시 조회하면 새 lockfileHash·결과로 통째로 바뀐다.
      // 늦게 온 이전 응답은 제공 화면이 세대 번호로 버리며, 이 함수는 요청을 보내거나 자동 재조회하지 않는다.
      const root = document.createElement('div');
      root.className = 'student-vulnerabilities';

      const SCAN_LABELS = {
        complete: '모두 조회(complete): 허용된 패키지를 모두 OSV에 조회했습니다.',
        partial: '일부 조회 실패(partial): 일부 패키지는 조회를 확인할 수 없습니다. 이미 받은 취약점 ID는 그대로 표시합니다.',
        not_checked: '아직 조회 안 함(not_checked): 승인된 공개 조회 대상 패키지가 없어 OSV에 조회하지 않았습니다.',
        not_configured: '조회 준비 미완료(not_configured): 조회 대상 프로젝트 설정이 필요합니다. 담당자가 준비합니다.',
        unverifiable: 'lock 파일 확인 불가(unverifiable): package-lock.json과 설치된 패키지를 대조할 수 없어 조회하지 않았습니다.',
      };
      const PKG_LABELS = {
        known_vulnerabilities: '알려진 항목 있음(known_vulnerabilities)',
        none_found: '알려진 항목 없음(none_found): 조회 범위의 OSV 데이터베이스에 알려진 항목이 없다는 뜻이며, 안전을 보장하지 않습니다.',
        unverifiable: '조회 확인 불가(unverifiable)',
      };
      // 정확한 설치 버전(semver)만 버전으로 인정한다. ^1.2.0 같은 범위는 설치 버전으로 표시하지 않는다.
      const EXACT_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
      const SAFE_CODE = /^[A-Z0-9_]{1,64}$/;

      const text = (v, fallback = '확인 불가') => (typeof v === 'string' && v.length > 0 ? v : fallback);
      const message = (t, kind) => {
        const p = document.createElement('p');
        p.className = `student-state student-state-${kind}`;
        p.textContent = t;
        return p;
      };
      const kv = (pairs) => {
        const dl = document.createElement('dl');
        dl.className = 'student-vulnerabilities-kv';
        for (const [label, value] of pairs) {
          if (value == null) continue;
          const dt = document.createElement('dt');
          dt.textContent = label;
          const dd = document.createElement('dd');
          dd.textContent = String(value);
          dl.append(dt, dd);
        }
        return dl;
      };
      const appendMode = () => {
        if (mode === 'demo') root.append(message('예제 데이터(demo) · 실제 조회 아님', 'note'));
      };
      const NOT_SAFE = '조회 실패·미조회는 "취약점 없음"이 아닙니다.';

      if (status === 'idle' || status == null) {
        root.setAttribute('data-student-vuln-state', 'idle');
        root.append(message('조회 전: 설치 패키지를 아직 조회하지 않았습니다. 보호 현황의 설치 패키지 조회를 직접 누르세요.', 'idle'));
        return root;
      }
      if (status === 'loading') {
        root.setAttribute('data-student-vuln-state', 'loading');
        root.append(message('조회 중: 설치 패키지와 OSV 취약점 정보를 조회하고 있습니다. 이전 결과는 현재 결과가 아닙니다.', 'loading'));
        return root;
      }
      if (status === 'error') {
        root.setAttribute('data-student-vuln-state', 'error');
        const code = error && typeof error.code === 'string' && SAFE_CODE.test(error.code) ? error.code : 'UNKNOWN';
        const msg = error && typeof error.message === 'string' && error.message ? error.message : '패키지 조회를 확인할 수 없습니다.';
        root.append(
          message(`조회 실패: ${msg} (오류 코드: ${code})`, 'error'),
          message(`이전 조회 결과는 표시하지 않습니다. ${NOT_SAFE}`, 'error'),
          message('다시 조회는 보호 현황의 설치 패키지 조회 버튼을 직접 누르세요. 자동으로 다시 조회하지 않습니다.', 'note'),
        );
        appendMode();
        return root;
      }
      if (status !== 'ok' || !data || typeof data !== 'object' || !Object.hasOwn(SCAN_LABELS, data.status)) {
        root.setAttribute('data-student-vuln-state', 'error');
        root.append(message(`조회 결과 형식을 확인할 수 없습니다. ${NOT_SAFE}`, 'error'));
        appendMode();
        return root;
      }

      // 전체 결과: package-lock.json 과 설치된 node_modules 메타데이터를 대조한 값이다.
      root.setAttribute('data-student-vuln-state', data.status);
      if (typeof data.lockfileHash === 'string') root.setAttribute('data-student-lockfile-hash', data.lockfileHash);
      root.append(message(`전체 조회 상태: ${SCAN_LABELS[data.status]}`, data.status === 'complete' ? 'ok' : data.status === 'partial' ? 'error' : 'note'));
      root.append(kv([
        ['lockfileVersion', data.lockfileVersion != null ? data.lockfileVersion : null],
        ['lockfileHash', typeof data.lockfileHash === 'string' ? data.lockfileHash : null],
        ['전체 확인 시각(checkedAt)', typeof data.checkedAt === 'string' ? data.checkedAt : null],
        ['상태 코드', typeof data.code === 'string' && SAFE_CODE.test(data.code) ? data.code : null],
        ['조회 제외 패키지 수', data.excluded && Number.isInteger(data.excluded.count) ? `${data.excluded.count}개(비공개·미허용 패키지는 밖으로 보내지 않음)` : null],
      ]));
      if (typeof data.lockfileHash === 'string') {
        root.append(message('값은 package-lock.json과 실제 설치된 node_modules 메타데이터를 대조한 결과입니다.', 'note'));
      }

      const packages = Array.isArray(data.packages) ? data.packages : [];
      if (packages.length === 0) {
        root.append(message(
          data.status === 'complete'
            ? '조회한 패키지가 없습니다.'
            : `표시할 패키지 결과가 없습니다. ${NOT_SAFE}`,
          'empty',
        ));
      } else {
        const ul = document.createElement('ul');
        ul.className = 'student-vulnerabilities-list';
        for (const pkg of packages) {
          const p = pkg && typeof pkg === 'object' ? pkg : {};
          const name = text(p.name);
          const exact = typeof p.version === 'string' && EXACT_VERSION.test(p.version);
          const version = exact ? p.version : '정확한 설치 버전 확인 불가';
          const vulns = Array.isArray(p.vulnerabilities) ? p.vulnerabilities : [];

          const li = document.createElement('li');
          li.className = 'student-vulnerabilities-item';
          li.setAttribute('data-student-package-name', name);
          li.setAttribute('data-student-package-version', exact ? p.version : 'unknown');

          let statusText = Object.hasOwn(PKG_LABELS, p.status) ? PKG_LABELS[p.status] : '조회 상태 확인 불가';
          if (p.status === 'unverifiable' && vulns.length > 0) {
            statusText = '일부 확인·전체 조회 확인 불가(unverifiable): 받은 취약점 ID는 아래에 그대로 표시합니다.';
          }
          li.append(kv([
            ['패키지(name)', name],
            ['설치 버전(version)', version],
            ['조회 상태(status)', statusText],
            ['출처(source)', text(p.source)],
            ['패키지 조회 시각(checkedAt)', text(p.checkedAt)],
          ]));

          if (vulns.length > 0) {
            const vl = document.createElement('ul');
            vl.className = 'student-vulnerabilities-findings';
            for (const v of vulns) {
              const item = document.createElement('li');
              item.textContent = `취약점 ID: ${text(v && v.id)} · 수정 시각(modified): ${text(v && v.modified)}`;
              vl.append(item);
            }
            li.append(vl);
          } else if (p.status === 'unverifiable') {
            li.append(message(`이 패키지는 조회를 확인할 수 없습니다. ${NOT_SAFE}`, 'error'));
          }
          ul.append(li);
        }
        root.append(ul);
      }

      root.append(message('OSV는 알려진 취약점 데이터베이스입니다. 조회 결과가 없다는 사실만으로 패키지나 앱 전체가 안전하다고 보장할 수 없습니다.', 'note'));
      appendMode();
      return root;
    },
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
      // 입력만으로 매번 새로 그린다. 다른 기록 선택·다시 불러오기·실패 시 이전 설명과
      // data-student-explanation-event 성공 표식이 남지 않는다. 요청을 보내지 않고, 실행 버튼을 만들지 않는다.
      const root = document.createElement('div');
      root.className = 'student-explanation';

      const SAFE_CODE = /^[A-Z0-9_]{1,64}$/;
      const STATE_KEYS = [
        { key: 'access', name: '접속' },
        { key: 'session', name: '세션' },
        { key: 'device', name: '기기' },
      ];
      // 실패 code 별 까닭. 제공 코드는 근거 불일치·실행 주장 등을 ON_AI_INVALID_OUTPUT 으로 넘긴다.
      const FAILURE_REASONS = {
        ON_AI_INVALID_INPUT: '근거 부족: 설명에 필요한 사건 근거·규칙이 없거나 확인할 수 없어 설명할 수 없습니다.',
        ON_AI_INVALID_OUTPUT: '근거가 맞지 않음: AI 응답의 근거 ID가 이 기록과 맞지 않거나, 빠진 근거·비밀 표기·지원하지 않는 조치가 있거나, AI가 이미 실행했다고 답해 이 설명은 쓸 수 없습니다.',
        SUBJECT_SCOPE_UNVERIFIED: '현재 로그인과 이 사건의 연결을 확인할 수 없어 설명할 수 없습니다.',
        CANCELLED: 'AI 설명 요청을 취소했습니다. 이전 설명은 현재 결과가 아닙니다.',
        REQUEST_CANCELLED: 'AI 설명 요청을 취소했습니다. 이전 설명은 현재 결과가 아닙니다.',
        WB_CLCO_CANCELLED: 'AI 설명 요청을 취소했습니다. 이전 설명은 현재 결과가 아닙니다.',
      };

      const message = (text, kind) => {
        const p = document.createElement('p');
        p.className = `student-state student-state-${kind}`;
        p.textContent = text;
        return p;
      };
      const heading = (text) => {
        const h = document.createElement('h3');
        h.className = 'student-explanation-heading';
        h.textContent = text;
        return h;
      };
      const listOf = (items) => {
        const ul = document.createElement('ul');
        for (const text of items) {
          const li = document.createElement('li');
          li.textContent = text;
          ul.append(li);
        }
        return ul;
      };
      // 실패·근거 불일치 화면: data-student-explanation-event 를 붙이지 않는다.
      const failure = (code, msg) => {
        const safeCode = typeof code === 'string' && SAFE_CODE.test(code) ? code : 'UNKNOWN';
        const safeMsg = typeof msg === 'string' && msg.length > 0 && msg.length <= 300 ? msg : 'AI 설명을 확인할 수 없습니다.';
        root.append(message(`AI 설명 실패: ${safeMsg} (오류 코드: ${safeCode})`, 'error'));
        if (Object.hasOwn(FAILURE_REASONS, safeCode)) root.append(message(FAILURE_REASONS[safeCode], 'error'));
        root.append(message('이 설명은 쓸 수 없습니다. 기록은 그대로입니다. AI 연결이나 응답 문제는 과제 실패가 아닙니다.', 'note'));
        return root;
      };

      const status = explanation && explanation.status;

      // 실패가 오면 event 가 없어도 오류를 먼저 보여 준다.
      if (status === 'error') {
        const err = explanation.error || {};
        return failure(err.code, err.message);
      }
      // 오류 없이 event 만 없으면 기록을 먼저 고르도록 안내한다.
      if (!event || typeof event.id !== 'string' || event.id.length === 0) {
        root.append(message('보안 기록에서 기록을 먼저 고르세요. 그다음 그 기록의 AI 설명을 직접 요청하세요.', 'idle'));
        return root;
      }
      if (!explanation || status === 'idle' || status == null) {
        root.append(message(`기록 ${event.id}의 AI 설명을 아직 요청하지 않았습니다.`, 'idle'));
        return root;
      }
      if (status === 'loading') {
        root.append(message(`기록 ${event.id}의 AI 설명을 요청하는 중입니다.`, 'loading'));
        return root;
      }
      if (status !== 'ok' || !explanation.data || typeof explanation.data !== 'object') {
        return failure('AI_REQUEST_UNVERIFIED', '응답 상태를 확인할 수 없습니다.');
      }

      const x = explanation.data;
      const evidence = Array.isArray(event.evidence) ? event.evidence : [];
      const evidenceText = new Map(evidence
        .filter((e) => e && typeof e.id === 'string')
        .map((e) => [e.id, typeof e.text === 'string' ? e.text : '']));
      const evidenceIds = Array.isArray(x.evidenceIds) ? x.evidenceIds : [];
      const proposals = Array.isArray(x.proposals) ? x.proposals : [];

      // 학생 쪽에서도 현재 event 와 다시 대조한다. 없는 근거 ID 를 맞춰 만들지 않고, 맞지 않으면 설명을 쓰지 않는다.
      if (typeof x.summary !== 'string' || x.summary.length === 0) {
        return failure('ON_AI_INVALID_OUTPUT', 'AI 요약이 없습니다.');
      }
      if (x.executed !== false) {
        return failure('ON_AI_INVALID_OUTPUT', 'AI가 이미 실행했다고 답했거나 실행 여부를 확인할 수 없습니다.');
      }
      if (evidenceIds.length === 0 || evidenceIds.some((id) => !evidenceText.has(id))) {
        return failure('ON_AI_INVALID_OUTPUT', '근거 ID가 이 기록의 근거와 맞지 않습니다.');
      }
      if (proposals.some((p) => !p || !Array.isArray(p.evidenceIds) || p.evidenceIds.some((id) => !evidenceText.has(id)))) {
        return failure('ON_AI_INVALID_OUTPUT', '제안의 근거 ID가 이 기록의 근거와 맞지 않습니다.');
      }

      // 성공한 설명에만 성공 표식을 붙인다.
      root.setAttribute('data-student-explanation-event', event.id);
      root.append(message(`사건 ID: ${event.id}`, 'ok'));

      root.append(heading('AI 설명(참고용)'));
      root.append(message(x.summary, 'note'));
      root.append(message('AI 설명은 해석입니다. 사실 판단은 아래 근거 글과 연동 시스템이 알려 준 상태로 하세요.', 'note'));

      // 인용한 근거: evidenceIds 를 현재 event.evidence 에서 찾아 근거 글과 함께 보여 준다.
      root.append(heading('인용한 근거'));
      root.append(listOf(evidenceIds.map((id) => `${id} — ${evidenceText.get(id)}`)));

      const rules = Array.isArray(event.rules) ? event.rules : [];
      root.append(heading('규칙'));
      root.append(rules.length === 0
        ? message('규칙 없음', 'empty')
        : listOf(rules.map((r) => `${r && typeof r.id === 'string' ? r.id : '확인 불가'} — ${r && typeof r.text === 'string' ? r.text : ''}`)));

      // 확인 불가 상태: unknown 은 정상·안전으로 바꾸지 않는다.
      const state = event.state && typeof event.state === 'object' ? event.state : {};
      const unknowns = STATE_KEYS.filter(({ key }) => state[key] === 'unknown');
      root.append(heading('확인 불가 상태'));
      root.append(unknowns.length === 0
        ? message('없음', 'empty')
        : listOf(unknowns.map(({ name }) => `${name}: 확인 불가(unknown)`)));
      if (unknowns.length > 0) root.append(message('확인 불가 상태는 정상이나 안전을 뜻하지 않습니다.', 'note'));

      // 조치 제안: 실행하지 않고 실행 버튼도 만들지 않는다.
      root.append(heading('조치 제안'));
      const supported = Array.isArray(event.supportedActions) ? event.supportedActions : [];
      if (proposals.length === 0) {
        root.append(message(supported.length === 0
          ? '연동 시스템이 지원하는 조치가 없어 제안이 없습니다(정상).'
          : 'AI가 제안한 조치가 없습니다.', 'empty'));
      } else {
        root.append(listOf(proposals.map((p) => {
          const action = typeof p.action === 'string' ? p.action : '확인 불가';
          const reason = typeof p.reason === 'string' && p.reason ? p.reason : '이유 없음';
          return `${action} — 이유: ${reason} · 근거: ${p.evidenceIds.join(', ')} · 사람 확인이 필요하며 실행되지 않았습니다.`;
        })));
      }
      root.append(message('설명과 제안만으로는 어떤 보안 조치도 실행되지 않습니다.', 'note'));
      root.append(message(`설명 확인 시각: ${typeof checkedAt === 'string' && checkedAt ? checkedAt : '시각 정보 없음'}`, 'note'));
      return root;
    },
    renderAction({ status, event, actionId, target, receipt, observation, message, confirmationExpiresAt, error } = {}) {
      // 입력만으로 매번 새로 그린다. 새 값이 오면 이전 대상·요청·결과 표시는 남지 않는다.
      // 학생 코드는 버튼·POST 요청·확인 티켓을 만들거나 저장하지 않는다. 조작은 제공 화면 버튼으로만 한다.
      const root = document.createElement('div');
      root.className = 'student-action';

      const SAFE_CODE = /^[A-Z0-9_]{1,64}$/;
      const text = (v) => (typeof v === 'string' && v.length > 0 ? v : null);
      const message_ = (t, kind) => {
        const p = document.createElement('p');
        p.className = `student-state student-state-${kind}`;
        p.textContent = t;
        return p;
      };
      const kv = document.createElement('dl');
      kv.className = 'student-action-kv';
      const add = (label, value) => {
        if (value == null || value === '') return;
        const dt = document.createElement('dt');
        dt.textContent = label;
        const dd = document.createElement('dd');
        dd.textContent = String(value);
        kv.append(dt, dd);
      };
      const PROVIDED_BUTTONS = '조작은 제공 화면의 「조치 준비」, 「대상과 조치를 확인했으며 집행합니다」, 「연동 시스템 결과만 재조회」, 「조치 화면 취소」 버튼으로만 합니다.';
      const REQUERY = '결과는 제공 화면의 「연동 시스템 결과만 재조회」를 직접 눌러 확인하세요. 자동으로 다시 집행하거나 재조회하지 않습니다.';
      const CANCEL_NOTE = '「조치 화면 취소」는 이미 서버에 전달된 조치의 효과를 되돌리지 않습니다.';

      const eventId = event && text(event.id);
      const evidenceIds = event && Array.isArray(event.evidence)
        ? event.evidence.map((e) => e && text(e.id)).filter(Boolean)
        : [];
      const r = receipt && typeof receipt === 'object' ? receipt : null;

      // 현재 사건·조치와 접수 기록이 같은 대상인지 확인한다. 다르면 이 결과를 현재 결과로 쓰지 않는다.
      const mismatch = r && (
        (text(r.eventId) && eventId && r.eventId !== eventId)
        || (text(r.actionId) && text(actionId) && r.actionId !== actionId)
      );

      // 현재 범위의 식별 정보(있는 것만). 확인 번호(confirmationId)는 입력에 없으며 만들거나 표시하지 않는다.
      const fillIdentity = (showReceiptStatus) => {
        add('사건 ID(event.id)', eventId);
        add('근거 ID', evidenceIds.length > 0 ? evidenceIds.join(', ') : null);
        add('조치(actionId)', text(actionId));
        if (target && typeof target === 'object') {
          add('실제 대상(target.id)', text(target.id));
          add('대상 세대(target.generation)', Number.isSafeInteger(target.generation) ? target.generation : null);
        }
        if (r) {
          add('요청 ID(requestId)', text(r.requestId));
          add('접수 ID(receiptId)', text(r.receiptId));
          add('버전(version)', Number.isSafeInteger(r.version) ? r.version : null);
          // 결과 불명 화면에서는 서버의 원래 상태값을 보여 주지 않는다(성공으로 읽히지 않게).
          if (showReceiptStatus) add('서버 기록 상태(receipt.status)', text(r.status));
        }
      };

      const finish = ({ showReceiptStatus = true, skipMessage = false } = {}) => {
        fillIdentity(showReceiptStatus);
        if (kv.children.length > 0) root.append(kv);
        if (r && r.replayed === true) {
          root.append(message_('같은 요청이 이미 기록돼 있어 서버가 기존 결과를 돌려줬습니다(replayed). 조치를 한 번 더 집행하지 않았습니다.', 'note'));
        }
        const extra = text(message);
        if (extra && !skipMessage) root.append(message_(`제공 화면 안내: ${extra}`, 'note'));
        root.append(message_(PROVIDED_BUTTONS, 'note'));
        return root;
      };

      const unknownResult = (reason) => {
        root.setAttribute('data-student-action-state', 'unknown');
        root.append(
          message_('결과 불명(unknown)', 'error'),
          message_(reason, 'error'),
          message_('성공으로도, 효과 없음으로도 판단하지 마세요. 이미 전달된 조치의 효과가 있을 수 있습니다.', 'error'),
          message_(REQUERY, 'note'),
          message_(CANCEL_NOTE, 'note'),
        );
        return finish({ showReceiptStatus: false });
      };

      const st = typeof status === 'string' ? status : 'unknown';

      // 초기 상태: 실행 경로가 열리지 않은 것이 정상임을 알려 준다.
      if (st === 'idle') {
        root.setAttribute('data-student-action-state', 'idle');
        root.append(
          message_('아직 미실행(idle): 준비·전달된 조치가 없습니다.', 'idle'),
          message_('AI 조치 제안은 제안일 뿐이며 실행되지 않았습니다. 사람이 대상과 조치를 확인해야 서버에 전달됩니다.', 'note'),
          message_('지금 기록에는 연동 시스템이 지원하는 조치가 없어(supportedActions 빈 배열) 「조치 준비」 버튼이 나오지 않는 것이 정상입니다.', 'note'),
        );
        const extra = text(message);
        if (extra) root.append(message_(`제공 화면 안내: ${extra}`, 'note'));
        return root;
      }

      // 현재 사건·요청이 있는 화면에만 바인딩 속성을 붙인다.
      if (eventId && !mismatch) root.setAttribute('data-student-action-event', eventId);
      if (r && text(r.requestId) && !mismatch) root.setAttribute('data-student-action-request', r.requestId);

      if (mismatch) {
        return unknownResult('접수 기록의 사건 또는 조치가 현재 선택과 맞지 않아, 이 결과를 현재 조치의 결과로 쓸 수 없습니다.');
      }

      switch (st) {
        case 'loading':
          root.setAttribute('data-student-action-state', 'loading');
          root.append(
            message_(r ? '연동 시스템 결과 조회 중(loading) · 아직 결과가 아닙니다.' : '조치 준비 중(loading) · 미실행', 'loading'),
          );
          return finish();
        case 'prepared': {
          root.setAttribute('data-student-action-state', 'prepared');
          const expires = text(confirmationExpiresAt);
          root.append(
            message_('준비됨·미실행(prepared): 아직 서버에 집행을 요청하지 않았습니다.', 'loading'),
            message_('사람 확인이 필요합니다. 아래 사건·근거·조치·실제 대상을 직접 확인한 뒤에만 제공 화면의 「대상과 조치를 확인했으며 집행합니다」를 누르세요.', 'note'),
            message_(`확인 기한(confirmationExpiresAt): ${expires || '확인 불가'} · 기한이 지나면 다시 준비해야 합니다.`, 'note'),
          );
          return finish();
        }
        case 'executing':
          root.setAttribute('data-student-action-state', 'executing');
          root.append(
            message_('서버에 전달 중(executing): 사람 확인 후 요청을 보내는 중입니다.', 'loading'),
            message_('결과가 아직 없습니다. 완료 아님 · 효과 미확인', 'loading'),
          );
          return finish();
        case 'pending':
          root.setAttribute('data-student-action-state', 'pending');
          root.append(
            message_('서버 접수·처리 중(pending): 서버가 요청을 받았습니다(ACK).', 'loading'),
            message_('접수(ACK)는 효과가 아닙니다. 연동 시스템의 효과는 아직 확인되지 않았습니다. 완료 아님', 'loading'),
            message_(REQUERY, 'note'),
          );
          return finish();
        case 'succeeded': {
          const obs = observation && typeof observation === 'object' ? observation : null;
          const observedAt = obs && text(obs.observedAt);
          if (!obs || obs.effectApplied !== true || !observedAt || !r || !text(r.receiptId)) {
            return unknownResult('succeeded 로 왔지만 연동 시스템의 효과 관측(observation.effectApplied: true, 관측 시각, receiptId)을 모두 확인할 수 없습니다.');
          }
          root.setAttribute('data-student-action-state', 'succeeded');
          root.append(
            message_('효과 확인(succeeded): 연동 시스템이 조치 효과를 관측했습니다.', 'ok'),
            message_(`관측 시각(observation.observedAt): ${observedAt}`, 'ok'),
            message_('effectApplied: true', 'ok'),
            message_(`접수 ID(receiptId): ${r.receiptId}`, 'ok'),
          );
          return finish();
        }
        case 'denied':
        case 'failed': {
          root.setAttribute('data-student-action-state', st);
          const reason = (error && text(error.message)) || text(message) || '사유 정보 없음';
          root.append(
            message_(st === 'denied' ? '거절(denied): 연동 시스템이 이 조치를 거절했습니다.' : '실패(failed): 연동 시스템이 조치를 처리하지 못했습니다.', 'error'),
            message_(`사유: ${reason}`, 'error'),
            message_('조치 효과는 적용되지 않은 것으로 보고됐습니다. 자동으로 다시 집행하지 않습니다.', 'note'),
          );
          return finish({ skipMessage: reason === text(message) });
        }
        case 'expired':
          root.setAttribute('data-student-action-state', 'expired');
          root.append(
            message_('확인 기한 지남(expired): 이 준비는 더 이상 집행할 수 없습니다.', 'error'),
            message_('제공 화면에서 「조치 준비」로 다시 준비하고 대상을 다시 확인하세요. 서버에 집행을 요청하지 않았습니다.', 'note'),
          );
          return finish();
        case 'error': {
          root.setAttribute('data-student-action-state', 'error');
          const code = error && typeof error.code === 'string' && SAFE_CODE.test(error.code) ? error.code : 'UNKNOWN';
          const msg = (error && text(error.message)) || '요청을 처리하지 못했습니다.';
          root.append(
            message_(`요청 처리 안 됨(error): ${msg} (오류 코드: ${code})`, 'error'),
            message_('조치가 실행됐다고 판단하지 마세요. 필요하면 제공 화면에서 다시 준비하세요.', 'note'),
          );
          return finish();
        }
        case 'unknown':
        default:
          return unknownResult(st === 'unknown'
            ? `연동 시스템 결과를 확인할 수 없습니다.${error && text(error.message) ? ` ${error.message}` : ''}`
            : `알 수 없는 상태 값(${st})이라 결과를 확인할 수 없습니다.`);
      }
    },
  };
}