/* ============================================
   NEWTECH DESIGN SYSTEM — SECTIONS
   Injects all demo content into <main class="site-main">
   ============================================ */

(function () {
	const main = document.querySelector('.site-main');
	if (!main) return;

	/* ---------- helpers ---------- */
	const h = (html) => {
		const d = document.createElement('div');
		d.innerHTML = html.trim();
		return d.firstElementChild;
	};

	/* ---------- 1. COLORS ---------- */
	const colorScales = {
		'Green (brand)': {
			tok: 'nt-green',
			steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
			hex: {
				50: '#ecfdf2',
				100: '#d1fae0',
				200: '#a4f0c0',
				300: '#6ee29a',
				400: '#3ccd77',
				500: '#1bb54a',
				600: '#11933b',
				700: '#0d7530',
				800: '#0c5d29',
				900: '#0a4a22',
				950: '#052a13',
			},
		},
		'Blue (accent)': {
			tok: 'nt-blue',
			steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
			hex: {
				50: '#ecf8fd',
				100: '#d0eefa',
				200: '#a3ddf4',
				300: '#6cc6eb',
				400: '#33addf',
				500: '#0098d4',
				600: '#007aae',
				700: '#00618b',
				800: '#014e70',
				900: '#04415d',
				950: '#022a3d',
			},
		},
		'Ink (neutral)': {
			tok: 'nt-ink',
			steps: [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
			hex: {
				0: '#ffffff',
				50: '#f7f8fa',
				100: '#eef0f3',
				200: '#dde2e8',
				300: '#c3cad4',
				400: '#9aa4b2',
				500: '#6b7684',
				600: '#4b5563',
				700: '#333c48',
				800: '#1f2731',
				900: '#141a22',
				950: '#0b0f14',
			},
		},
	};

	const colorSection = `
    <section id="colors" class="section">
      <div class="section__head">
        <div class="section__kicker">01 · Foundations</div>
        <h2 class="section__title">Paleta de colores</h2>
        <p class="section__desc">Derivada directamente del logo: verde y azul de los nodos, sobre una neutra fría (Ink). Cada color tiene 11 pasos para cubrir UI, estados, fondos y accesibilidad. Ratio mínimo AA en pares de uso.</p>
      </div>

      <div class="grid grid--3" style="margin-bottom:32px">
        <div class="brand-swatch brand-swatch--green">
          <div>
            <div class="brand-swatch__name">Brand · Primario</div>
            <div class="brand-swatch__value">Newtech Green</div>
          </div>
          <div class="row" style="justify-content:space-between">
            <span class="brand-swatch__hex">#1BB54A · --nt-green-500</span>
            <span class="brand-swatch__dots"><span class="on"></span><span class="on"></span><span></span></span>
          </div>
        </div>
        <div class="brand-swatch brand-swatch--blue">
          <div>
            <div class="brand-swatch__name">Accent · Secundario</div>
            <div class="brand-swatch__value">Newtech Blue</div>
          </div>
          <div class="row" style="justify-content:space-between">
            <span class="brand-swatch__hex">#0098D4 · --nt-blue-500</span>
            <span class="brand-swatch__dots"><span class="on"></span><span></span><span></span></span>
          </div>
        </div>
        <div class="brand-swatch brand-swatch--ink">
          <div>
            <div class="brand-swatch__name">Ink · Texto & superficies oscuras</div>
            <div class="brand-swatch__value">Newtech Ink</div>
          </div>
          <div class="row" style="justify-content:space-between">
            <span class="brand-swatch__hex">#0B0F14 · --nt-ink-950</span>
            <span class="brand-swatch__dots"><span class="on"></span><span></span><span></span></span>
          </div>
        </div>
      </div>

      <div class="grid grid--3">
        ${Object.entries(colorScales)
					.map(
						([name, scale]) => `
          <div class="swatch-col">
            <div class="swatch-col__head">
              <div class="swatch-col__name">${name}</div>
              <div class="swatch-col__hint">--${scale.tok}-[step]</div>
            </div>
            ${scale.steps
							.map(
								(s) => `
              <div class="swatch-row">
                <div class="swatch-chip" style="background:${scale.hex[s]}"></div>
                <div class="swatch-row__label">${scale.tok}-${s}</div>
                <div class="swatch-row__hex">${scale.hex[s]}</div>
              </div>
            `
							)
							.join('')}
          </div>
        `
					)
					.join('')}
      </div>

      <div class="grid grid--4" style="margin-top:32px">
        ${[
					['success', 'Éxito', '#1bb54a', '#ecfdf2'],
					['info', 'Información', '#0098d4', '#ecf8fd'],
					['warn', 'Advertencia', '#f59e0b', '#fef3c7'],
					['danger', 'Peligro', '#e53935', '#fee2e2'],
				]
					.map(
						([k, name, c, bg]) => `
          <div class="nt-card" style="padding:0;overflow:hidden">
            <div style="height:64px;background:${c};display:flex;align-items:center;padding:0 18px;color:#fff;font-weight:700">${name}</div>
            <div style="padding:14px 18px">
              <div style="font-family:var(--font-mono);font-size:12px;color:var(--text-muted)">--nt-${k}</div>
              <div style="font-family:var(--font-mono);font-size:12px">${c}</div>
              <div style="margin-top:10px;padding:8px 12px;background:${bg};border-radius:var(--r-sm);font-size:12px;color:var(--text-primary)">Fondo suave · --nt-${k}-bg</div>
            </div>
          </div>
        `
					)
					.join('')}
      </div>
    </section>
  `;

	/* ---------- 2. TYPOGRAPHY ---------- */
	const typeSection = `
    <section id="type" class="section">
      <div class="section__head">
        <div class="section__kicker">02 · Foundations</div>
        <h2 class="section__title">Tipografía</h2>
        <p class="section__desc">DM Sans como familia principal — geométrica, abierta, alineada con la forma del wordmark. JetBrains Mono para código y tokens. Tracking ajustado en tamaños grandes para compensar la anchura natural.</p>
      </div>

      <div class="grid grid--2" style="margin-bottom:40px">
        <div class="nt-card" style="padding:32px">
          <div class="mono muted">--font-sans · 'DM Sans'</div>
          <div style="font-family:var(--font-sans);font-size:84px;font-weight:700;letter-spacing:-0.03em;line-height:1;margin:12px 0 8px">Aa</div>
          <div style="font-family:var(--font-sans);font-size:14px;color:var(--text-secondary)">ABCDEFGHIJKLMNÑOPQRSTUVWXYZ<br>abcdefghijklmnñopqrstuvwxyz<br>0123456789 · áéíóú ¿¡ @#&amp;%</div>
          <div style="margin-top:20px;display:flex;gap:20px;font-size:13px;color:var(--text-secondary)">
            <span><b style="color:var(--text-primary)">400</b> Regular</span>
            <span><b style="color:var(--text-primary)">500</b> Medium</span>
            <span><b style="color:var(--text-primary)">600</b> Semibold</span>
            <span><b style="color:var(--text-primary)">700</b> Bold</span>
            <span><b style="color:var(--text-primary)">800</b> Extrabold</span>
          </div>
        </div>
        <div class="nt-card" style="padding:32px">
          <div class="mono muted">--font-mono · 'JetBrains Mono'</div>
          <div style="font-family:var(--font-mono);font-size:84px;font-weight:500;letter-spacing:-0.02em;line-height:1;margin:12px 0 8px">{ }</div>
          <div style="font-family:var(--font-mono);font-size:13px;color:var(--text-secondary);white-space:pre-wrap;line-height:1.6">// tokens.json
{
  "brand": "#1BB54A",
  "accent": "#0098D4",
  "radius": 8
}</div>
        </div>
      </div>

      <div class="nt-card" style="padding:8px 28px">
        ${[
					[
						'display-xl',
						'60 / 62',
						'700',
						'Construimos tecnología que impulsa.',
						60,
						1.03,
						'-0.03em',
					],
					[
						'display-lg',
						'48 / 52',
						'700',
						'Una identidad, tres productos.',
						48,
						1.08,
						'-0.03em',
					],
					[
						'h1',
						'32 / 38',
						'700',
						'Sistema de diseño Newtech',
						32,
						1.2,
						'-0.02em',
					],
					[
						'h2',
						'24 / 30',
						'700',
						'Componentes consistentes',
						24,
						1.25,
						'-0.015em',
					],
					['h3', '20 / 28', '600', 'Secciones y cabeceras', 20, 1.3, '-0.01em'],
					[
						'body-lg',
						'18 / 28',
						'400',
						'Texto destacado para párrafos de introducción.',
						18,
						1.55,
						'0',
					],
					[
						'body',
						'15 / 24',
						'400',
						'Texto base para la mayoría de la interfaz.',
						15,
						1.55,
						'0',
					],
					[
						'body-sm',
						'14 / 22',
						'400',
						'Texto secundario, tablas densas, descripciones.',
						14,
						1.55,
						'0',
					],
					[
						'caption',
						'12 / 16',
						'500',
						'ETIQUETAS · METADATOS · TOKEN',
						12,
						1.35,
						'0.06em',
					],
				]
					.map(
						([tok, size, w, sample, px, lh, ls]) => `
          <div class="type-row">
            <div class="type-row__token">${tok}</div>
            <div class="type-row__meta">${size}<br/>${w}</div>
            <div class="type-row__sample" style="font-size:${px}px;font-weight:${w};line-height:${lh};letter-spacing:${ls}">${sample}</div>
          </div>
        `
					)
					.join('')}
      </div>
    </section>
  `;

	/* ---------- 3. SPACING / RADIUS / ELEVATION ---------- */
	const spaceSection = `
    <section id="space" class="section">
      <div class="section__head">
        <div class="section__kicker">03 · Foundations</div>
        <h2 class="section__title">Espacio, radios y elevación</h2>
        <p class="section__desc">Escala base 4 px. Radios con 8 px como predeterminado — suficiente para sentirse moderno sin perder el tono corporativo. Sombras sutiles con tinte neutro frío.</p>
      </div>

      <div class="grid grid--2">
        <div class="scale-card">
          <div style="font-weight:700;margin-bottom:12px">Espaciado · base 4</div>
          ${[
						['s-1', 4],
						['s-2', 8],
						['s-3', 12],
						['s-4', 16],
						['s-5', 20],
						['s-6', 24],
						['s-8', 32],
						['s-10', 40],
						['s-12', 48],
						['s-16', 64],
						['s-20', 80],
					]
						.map(
							([t, v]) => `
            <div class="space-row">
              <div class="space-row__token">--${t}</div>
              <div class="space-row__px">${v} px</div>
              <div><div class="space-row__bar" style="width:${v * 2}px"></div></div>
            </div>
          `
						)
						.join('')}
        </div>

        <div class="stack">
          <div class="scale-card">
            <div style="font-weight:700;margin-bottom:16px">Radios</div>
            <div class="radius-grid">
              ${[
								['xs', 4],
								['sm', 6],
								['md', 8],
								['lg', 12],
								['xl', 16],
								['2xl', 20],
							]
								.map(
									([t, v]) => `
                <div class="radius-card" style="border-radius:${v}px">
                  <div class="radius-card__swatch" style="border-radius:${v}px"></div>
                  <div class="radius-card__token">--r-${t}</div>
                  <div class="radius-card__px">${v}px</div>
                </div>
              `
								)
								.join('')}
            </div>
          </div>
          <div class="scale-card">
            <div style="font-weight:700;margin-bottom:16px">Elevación</div>
            <div class="grid grid--3">
              ${[
								['xs', '--sh-xs'],
								['sm', '--sh-sm'],
								['md', '--sh-md'],
								['lg', '--sh-lg'],
								['xl', '--sh-xl'],
							]
								.map(
									([t, tok]) => `
                <div class="elev-card" style="box-shadow:var(--sh-${t})">
                  <div style="font-weight:700">Shadow ${t}</div>
                  <div class="elev-card__token">${tok}</div>
                </div>
              `
								)
								.join('')}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

	/* ---------- 4. COMPONENTS ---------- */
	const componentsSection = `
    <section id="components" class="section">
      <div class="section__head">
        <div class="section__kicker">04 · Library</div>
        <h2 class="section__title">Componentes</h2>
        <p class="section__desc">Piezas de UI preparadas para las tres apps. Todos los componentes respetan tokens — cambiar la marca verde cambia toda la biblioteca.</p>
      </div>

      <div class="grid grid--2">
        <!-- Buttons -->
        <div class="demo">
          <div class="demo__head"><div class="demo__name">Botones</div><div class="demo__tag">.nt-btn</div></div>
          <div class="demo__body demo__body--stack">
            <div class="demo-label">Variantes</div>
            <div class="row">
              <button class="nt-btn">Primario</button>
              <button class="nt-btn nt-btn--secondary">Secundario</button>
              <button class="nt-btn nt-btn--outline">Outline</button>
              <button class="nt-btn nt-btn--ghost">Ghost</button>
              <button class="nt-btn nt-btn--danger">Peligro</button>
            </div>
            <div class="demo-label">Tamaños</div>
            <div class="row">
              <button class="nt-btn nt-btn--sm">Pequeño</button>
              <button class="nt-btn">Base</button>
              <button class="nt-btn nt-btn--lg">Grande</button>
            </div>
            <div class="demo-label">Con icono</div>
            <div class="row">
              <button class="nt-btn"><i class="ti ti-plus"></i> Nuevo</button>
              <button class="nt-btn nt-btn--outline"><i class="ti ti-filter"></i> Filtrar</button>
              <button class="nt-btn nt-btn--ghost"><i class="ti ti-download"></i> Exportar</button>
              <button class="nt-btn nt-btn--icon nt-btn--outline"><i class="ti ti-dots"></i></button>
            </div>
            <div class="demo-label">Estados</div>
            <div class="row">
              <button class="nt-btn">Normal</button>
              <button class="nt-btn" disabled>Deshabilitado</button>
              <button class="nt-btn"><i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> Cargando…</button>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="demo">
          <div class="demo__head"><div class="demo__name">Formularios</div><div class="demo__tag">.nt-input · .nt-field</div></div>
          <div class="demo__body demo__body--stack">
            <div class="nt-field">
              <label class="nt-label">Nombre completo</label>
              <input class="nt-input" placeholder="María Rodríguez" value="Ana Pérez"/>
              <div class="nt-helper">Este nombre aparecerá en las facturas.</div>
            </div>
            <div class="nt-field">
              <label class="nt-label">Correo electrónico</label>
              <div class="nt-input-group">
                <i class="ti ti-mail tabler-icon"></i>
                <input class="nt-input" placeholder="correo@newtechsa.com"/>
              </div>
            </div>
            <div class="nt-field">
              <label class="nt-label">Servicio</label>
              <select class="nt-select">
                <option>Newtech Software</option>
                <option>Newtech Global</option>
                <option>Newtech Teleservices</option>
              </select>
            </div>
            <div class="nt-field">
              <label class="nt-label">Mensaje con error</label>
              <input class="nt-input" aria-invalid="true" value="correo-no-valido"/>
              <div class="nt-helper nt-helper--error">Formato de correo incorrecto.</div>
            </div>
            <div class="row">
              <label class="row" style="gap:8px;font-size:14px"><input type="checkbox" class="nt-check" checked/> Acepto los términos</label>
              <label class="row" style="gap:8px;font-size:14px"><input type="radio" class="nt-check nt-check--radio" checked name="r1"/> Mensual</label>
              <label class="row" style="gap:8px;font-size:14px"><input type="radio" class="nt-check nt-check--radio" name="r1"/> Anual</label>
              <label class="row" style="gap:8px;font-size:14px"><input type="checkbox" class="nt-toggle" checked/> Notificaciones</label>
            </div>
          </div>
        </div>

        <!-- Badges -->
        <div class="demo">
          <div class="demo__head"><div class="demo__name">Badges & Tags</div><div class="demo__tag">.nt-badge</div></div>
          <div class="demo__body">
            <span class="nt-badge">Default</span>
            <span class="nt-badge nt-badge--brand">Activo</span>
            <span class="nt-badge nt-badge--accent">Info</span>
            <span class="nt-badge nt-badge--success nt-badge--dot">Pagado</span>
            <span class="nt-badge nt-badge--info nt-badge--dot">En curso</span>
            <span class="nt-badge nt-badge--warn nt-badge--dot">Revisar</span>
            <span class="nt-badge nt-badge--danger nt-badge--dot">Vencido</span>
            <span class="nt-badge"><i class="ti ti-star-filled" style="color:#f59e0b;font-size:12px"></i> Premium</span>
          </div>
        </div>

        <!-- Alerts -->
        <div class="demo">
          <div class="demo__head"><div class="demo__name">Alertas</div><div class="demo__tag">.nt-alert</div></div>
          <div class="demo__body demo__body--stack">
            <div class="nt-alert nt-alert--success">
              <i class="ti ti-circle-check nt-alert__icon" style="font-size:20px"></i>
              <div><p class="nt-alert__title">Factura generada correctamente</p><p class="nt-alert__body">La factura #NT-0284 fue enviada al cliente.</p></div>
            </div>
            <div class="nt-alert nt-alert--info">
              <i class="ti ti-info-circle nt-alert__icon" style="font-size:20px"></i>
              <div><p class="nt-alert__title">Mantenimiento programado</p><p class="nt-alert__body">El sistema no estará disponible el sábado de 02:00 a 04:00.</p></div>
            </div>
            <div class="nt-alert nt-alert--warn">
              <i class="ti ti-alert-triangle nt-alert__icon" style="font-size:20px"></i>
              <div><p class="nt-alert__title">Sincronización con retraso</p><p class="nt-alert__body">Algunos registros se están procesando más lento de lo habitual.</p></div>
            </div>
            <div class="nt-alert nt-alert--danger">
              <i class="ti ti-alert-circle nt-alert__icon" style="font-size:20px"></i>
              <div><p class="nt-alert__title">No se pudo completar la operación</p><p class="nt-alert__body">Revisa la conexión y vuelve a intentarlo.</p></div>
            </div>
          </div>
        </div>

        <!-- Avatars, Progress -->
        <div class="demo">
          <div class="demo__head"><div class="demo__name">Avatares y progreso</div><div class="demo__tag">.nt-avatar · .nt-progress</div></div>
          <div class="demo__body demo__body--stack">
            <div class="row">
              <span class="nt-avatar nt-avatar--sm">AP</span>
              <span class="nt-avatar">MR</span>
              <span class="nt-avatar nt-avatar--lg" style="background:var(--brand-soft);color:var(--nt-green-700)">NT</span>
              <span class="nt-avatar nt-avatar--lg" style="background:var(--nt-ink-900);color:#fff"><i class="ti ti-user"></i></span>
              <div style="display:flex;margin-left:12px">
                <span class="nt-avatar" style="border:2px solid white;margin-right:-10px">AP</span>
                <span class="nt-avatar" style="border:2px solid white;margin-right:-10px;background:var(--brand-soft);color:var(--nt-green-700)">LR</span>
                <span class="nt-avatar" style="border:2px solid white;background:#f59e0b1a;color:#b45309">JS</span>
              </div>
            </div>
            <div class="stack" style="gap:16px;width:100%">
              <div>
                <div class="row" style="justify-content:space-between;margin-bottom:6px;font-size:13px">
                  <span>Migración de datos</span><span class="muted">72%</span>
                </div>
                <div class="nt-progress"><div class="nt-progress__bar" style="width:72%"></div></div>
              </div>
              <div>
                <div class="row" style="justify-content:space-between;margin-bottom:6px;font-size:13px">
                  <span>Uso de almacenamiento</span><span class="muted">28%</span>
                </div>
                <div class="nt-progress"><div class="nt-progress__bar" style="width:28%"></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="demo">
          <div class="demo__head"><div class="demo__name">Pestañas</div><div class="demo__tag">.nt-tabs</div></div>
          <div class="demo__body demo__body--stack">
            <div class="nt-tabs">
              <button class="nt-tab nt-tab--active">Resumen</button>
              <button class="nt-tab">Movimientos</button>
              <button class="nt-tab">Documentos</button>
              <button class="nt-tab">Actividad</button>
              <button class="nt-tab">Ajustes</button>
            </div>
            <div class="muted" style="font-size:13px">Contenido de la pestaña activa · 4 movimientos recientes.</div>
          </div>
        </div>
      </div>

      <!-- Tables full width -->
      <div class="demo" style="margin-top:24px">
        <div class="demo__head">
          <div class="demo__name">Tabla de datos</div>
          <div class="row" style="gap:8px">
            <button class="nt-btn nt-btn--outline nt-btn--sm"><i class="ti ti-filter"></i> Filtros</button>
            <button class="nt-btn nt-btn--sm"><i class="ti ti-plus"></i> Nuevo cliente</button>
          </div>
        </div>
        <table class="nt-table">
          <thead>
            <tr>
              <th style="width:40px"><input type="checkbox" class="nt-check"/></th>
              <th>Cliente</th>
              <th>Producto</th>
              <th>Importe</th>
              <th>Estado</th>
              <th>Actualizado</th>
              <th style="width:40px"></th>
            </tr>
          </thead>
          <tbody>
            ${[
							[
								'Banco Popular',
								'MR',
								'Software · Core Banking',
								'USD 42,800',
								'success',
								'Pagado',
								'hace 2 h',
							],
							[
								'Altice Dominicana',
								'AD',
								'Teleservices',
								'USD 18,240',
								'info',
								'En curso',
								'hace 5 h',
							],
							[
								'Cervecería Nacional',
								'CN',
								'Global · Portal',
								'USD 7,500',
								'warn',
								'Revisar',
								'ayer',
							],
							[
								'Superintendencia de Bancos',
								'SB',
								'Software · Compliance',
								'USD 61,000',
								'success',
								'Pagado',
								'hace 3 d',
							],
							[
								'Claro',
								'CL',
								'Teleservices',
								'USD 12,400',
								'danger',
								'Vencido',
								'hace 8 d',
							],
						]
							.map(
								([name, initials, product, amount, state, label, when]) => `
              <tr>
                <td><input type="checkbox" class="nt-check"/></td>
                <td>
                  <div class="row">
                    <span class="nt-avatar nt-avatar--sm">${initials}</span>
                    <div><div style="font-weight:600">${name}</div><div class="muted" style="font-size:12px">${name.toLowerCase().replace(/\s/g, '')}.com</div></div>
                  </div>
                </td>
                <td>${product}</td>
                <td style="font-variant-numeric: tabular-nums; font-weight:600">${amount}</td>
                <td><span class="nt-badge nt-badge--${state} nt-badge--dot">${label}</span></td>
                <td class="muted">${when}</td>
                <td><button class="nt-btn nt-btn--icon nt-btn--ghost nt-btn--sm"><i class="ti ti-dots-vertical"></i></button></td>
              </tr>
            `
							)
							.join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;

	/* ---------- 5. ICONS ---------- */
	const iconNames = [
		'home',
		'layout-dashboard',
		'users',
		'user-circle',
		'building',
		'briefcase',
		'file-invoice',
		'receipt',
		'credit-card',
		'cash',
		'wallet',
		'chart-bar',
		'chart-pie',
		'report-analytics',
		'calendar',
		'clock',
		'bell',
		'mail',
		'message-circle',
		'phone',
		'headset',
		'device-laptop',
		'server',
		'cloud',
		'lock',
		'shield-check',
		'settings',
		'adjustments',
		'filter',
		'search',
		'plus',
		'edit',
		'trash',
		'download',
		'upload',
		'share',
		'chevron-right',
		'chevron-down',
		'arrow-up-right',
		'circle-check',
		'alert-triangle',
		'info-circle',
	];
	const iconsSection = `
    <section id="icons" class="section">
      <div class="section__head">
        <div class="section__kicker">05 · Library</div>
        <h2 class="section__title">Iconografía · Tabler</h2>
        <p class="section__desc">Biblioteca Tabler Icons (5 880+ iconos, trazo 2 px). Mantener un único tamaño por contexto: 16 px en textos, 18–20 px en botones, 22–24 px en cabeceras. Color heredado vía <span class="mono">color</span>.</p>
      </div>

      <div class="nt-card" style="padding:20px">
        <div class="icon-grid">
          ${iconNames.map((n) => `<div class="icon-tile" title="ti-${n}"><i class="ti ti-${n}"></i><span>${n}</span></div>`).join('')}
        </div>
        <div class="row" style="margin-top:20px;justify-content:space-between;border-top:1px solid var(--surface-border);padding-top:16px">
          <span class="muted" style="font-size:13px">Mostrando 42 de 5 880 iconos</span>
          <a href="https://tabler.io/icons" target="_blank" class="nt-btn nt-btn--outline nt-btn--sm">Ver biblioteca completa <i class="ti ti-external-link"></i></a>
        </div>
      </div>
    </section>
  `;

	/* ---------- 6. LOGO & BRAND ---------- */
	const brandSection = `
    <section id="brand" class="section">
      <div class="section__head">
        <div class="section__kicker">06 · Brand</div>
        <h2 class="section__title">Logotipo y uso</h2>
        <p class="section__desc">El wordmark "newtech" siempre aparece acompañado de la marca de nodos (verde/azul). Mantén el área de respeto equivalente a una 'n'. Nunca deformar, rotar ni cambiar colores.</p>
      </div>

      <div class="grid grid--4">
        <div>
          <div class="logo-canvas"><span class="nt-logo"><span class="nt-logo__mark"><svg viewBox="0 0 40 30"><circle cx="8" cy="22" r="3" fill="#1bb54a"/><circle cx="14" cy="14" r="2.5" fill="#1bb54a"/><circle cx="20" cy="20" r="3" fill="#0098d4"/><circle cx="22" cy="8" r="2.5" fill="#1bb54a"/><circle cx="28" cy="14" r="3" fill="#0098d4"/><circle cx="34" cy="6" r="2.5" fill="#1bb54a"/><circle cx="32" cy="22" r="2.5" fill="#1bb54a"/></svg></span>newtech</span></div>
          <div class="muted" style="font-size:13px;margin-top:10px">Primario · fondo claro</div>
        </div>
        <div>
          <div class="logo-canvas logo-canvas--dark"><span class="nt-logo"><span class="nt-logo__mark"><svg viewBox="0 0 40 30"><circle cx="8" cy="22" r="3" fill="#1bb54a"/><circle cx="14" cy="14" r="2.5" fill="#1bb54a"/><circle cx="20" cy="20" r="3" fill="#0098d4"/><circle cx="22" cy="8" r="2.5" fill="#1bb54a"/><circle cx="28" cy="14" r="3" fill="#0098d4"/><circle cx="34" cy="6" r="2.5" fill="#1bb54a"/><circle cx="32" cy="22" r="2.5" fill="#1bb54a"/></svg></span>newtech</span></div>
          <div class="muted" style="font-size:13px;margin-top:10px">Fondo oscuro · wordmark blanco</div>
        </div>
        <div>
          <div class="logo-canvas logo-canvas--green"><span class="nt-logo"><span class="nt-logo__mark"><svg viewBox="0 0 40 30"><circle cx="8" cy="22" r="3" fill="#fff"/><circle cx="14" cy="14" r="2.5" fill="#fff"/><circle cx="20" cy="20" r="3" fill="#fff"/><circle cx="22" cy="8" r="2.5" fill="#fff"/><circle cx="28" cy="14" r="3" fill="#fff"/><circle cx="34" cy="6" r="2.5" fill="#fff"/><circle cx="32" cy="22" r="2.5" fill="#fff"/></svg></span>newtech</span></div>
          <div class="muted" style="font-size:13px;margin-top:10px">Monocromo · brand verde</div>
        </div>
        <div>
          <div class="logo-canvas logo-canvas--blue"><span class="nt-logo"><span class="nt-logo__mark"><svg viewBox="0 0 40 30"><circle cx="8" cy="22" r="3" fill="#fff"/><circle cx="14" cy="14" r="2.5" fill="#fff"/><circle cx="20" cy="20" r="3" fill="#fff"/><circle cx="22" cy="8" r="2.5" fill="#fff"/><circle cx="28" cy="14" r="3" fill="#fff"/><circle cx="34" cy="6" r="2.5" fill="#fff"/><circle cx="32" cy="22" r="2.5" fill="#fff"/></svg></span>newtech</span></div>
          <div class="muted" style="font-size:13px;margin-top:10px">Monocromo · accent azul</div>
        </div>
      </div>
    </section>
  `;

	/* ---------- 7. EXAMPLE SCREENS ---------- */
	const examplesSection = `
    <section id="examples" class="section">
      <div class="section__head">
        <div class="section__kicker">07 · In the wild</div>
        <h2 class="section__title">Aplicaciones reales</h2>
        <p class="section__desc">El sistema aplicado a las tres apps de Newtech. Mismos tokens, distinto producto — la consistencia nace del lenguaje, no de la uniformidad rígida.</p>
      </div>

      <!-- Light dashboard (Software) -->
      <div class="screen" style="margin-bottom:32px">
        <aside class="screen__side">
          <div class="screen__brand">
            <span class="nt-logo" style="font-size:17px"><span class="nt-logo__mark"><svg viewBox="0 0 40 30"><circle cx="8" cy="22" r="3" fill="#1bb54a"/><circle cx="20" cy="20" r="3" fill="#0098d4"/><circle cx="28" cy="14" r="3" fill="#0098d4"/><circle cx="34" cy="6" r="2.5" fill="#1bb54a"/></svg></span>newtech</span>
          </div>
          <div class="screen__section-label">Principal</div>
          <div class="screen__item screen__item--active"><i class="ti ti-layout-dashboard"></i> Panel</div>
          <div class="screen__item"><i class="ti ti-users"></i> Clientes <span class="nt-nav-item__count" style="margin-left:auto">284</span></div>
          <div class="screen__item"><i class="ti ti-file-invoice"></i> Facturación</div>
          <div class="screen__item"><i class="ti ti-briefcase"></i> Proyectos</div>
          <div class="screen__section-label">Análisis</div>
          <div class="screen__item"><i class="ti ti-chart-bar"></i> Reportes</div>
          <div class="screen__item"><i class="ti ti-report-analytics"></i> KPIs</div>
          <div class="screen__section-label">Sistema</div>
          <div class="screen__item"><i class="ti ti-settings"></i> Ajustes</div>
          <div class="screen__item"><i class="ti ti-headset"></i> Soporte</div>
        </aside>
        <div class="screen__main">
          <div class="screen__topbar">
            <div>
              <div class="muted" style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Newtech Software</div>
              <div class="screen__title">Panel general</div>
            </div>
            <div class="screen__search">
              <div class="nt-input-group"><i class="ti ti-search tabler-icon"></i><input class="nt-input" placeholder="Buscar clientes, facturas…"/></div>
            </div>
            <button class="nt-btn nt-btn--icon nt-btn--ghost"><i class="ti ti-bell"></i></button>
            <span class="nt-avatar">AP</span>
          </div>

          <div class="grid grid--4" style="margin-bottom:20px">
            <div class="nt-card kpi">
              <div class="kpi__label">Ingresos MTD</div>
              <div class="kpi__value">$284.3K</div>
              <div class="kpi__delta kpi__delta--up"><i class="ti ti-trending-up"></i> 12.4% vs mes anterior</div>
            </div>
            <div class="nt-card kpi">
              <div class="kpi__label">Clientes activos</div>
              <div class="kpi__value">3 204</div>
              <div class="kpi__delta kpi__delta--up"><i class="ti ti-trending-up"></i> 4.1%</div>
            </div>
            <div class="nt-card kpi">
              <div class="kpi__label">Tickets abiertos</div>
              <div class="kpi__value">48</div>
              <div class="kpi__delta kpi__delta--down"><i class="ti ti-trending-down"></i> 3.2%</div>
            </div>
            <div class="nt-card kpi">
              <div class="kpi__label">NPS</div>
              <div class="kpi__value">72</div>
              <div class="kpi__delta kpi__delta--up"><i class="ti ti-trending-up"></i> +4 pts</div>
            </div>
          </div>

          <div class="grid" style="grid-template-columns:2fr 1fr;gap:20px">
            <div class="nt-card" style="padding:22px">
              <div class="row" style="justify-content:space-between;margin-bottom:16px">
                <div>
                  <div style="font-weight:700;font-size:16px">Ingresos · últimos 12 meses</div>
                  <div class="muted" style="font-size:13px">USD miles · comparativa 2025 vs 2026</div>
                </div>
                <div class="nt-tabs" style="width:auto;border:none">
                  <button class="nt-tab">6M</button>
                  <button class="nt-tab nt-tab--active">12M</button>
                  <button class="nt-tab">YTD</button>
                </div>
              </div>
              <svg viewBox="0 0 600 200" width="100%" height="180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1bb54a" stop-opacity="0.3"/><stop offset="100%" stop-color="#1bb54a" stop-opacity="0"/></linearGradient>
                </defs>
                ${[0, 1, 2, 3].map((i) => `<line x1="0" y1="${40 + i * 40}" x2="600" y2="${40 + i * 40}" stroke="#eef0f3"/>`).join('')}
                <path d="M0,150 C50,140 90,120 140,110 C190,100 230,130 280,120 C340,106 380,70 430,68 C470,66 510,80 600,50 L600,200 L0,200 Z" fill="url(#g1)"/>
                <path d="M0,150 C50,140 90,120 140,110 C190,100 230,130 280,120 C340,106 380,70 430,68 C470,66 510,80 600,50" fill="none" stroke="#1bb54a" stroke-width="2.5"/>
                <path d="M0,170 C50,166 90,156 140,152 C190,148 230,160 280,156 C340,150 380,138 430,136 C470,134 510,140 600,128" fill="none" stroke="#0098d4" stroke-width="2" stroke-dasharray="5 5" opacity="0.6"/>
              </svg>
              <div class="row" style="gap:20px;margin-top:12px;font-size:13px">
                <span class="row" style="gap:6px"><span class="dot dot--green"></span> 2026 · $2.84M</span>
                <span class="row" style="gap:6px"><span class="dot dot--blue"></span> 2025 · $2.31M</span>
              </div>
            </div>
            <div class="nt-card" style="padding:22px">
              <div style="font-weight:700;font-size:16px;margin-bottom:16px">Productos</div>
              ${[
								['Software', 62, '#1bb54a'],
								['Teleservices', 24, '#0098d4'],
								['Global', 14, '#6ee29a'],
							]
								.map(
									([n, v, c]) => `
                <div style="margin-bottom:14px">
                  <div class="row" style="justify-content:space-between;font-size:13px;margin-bottom:6px"><span>${n}</span><span style="font-weight:600">${v}%</span></div>
                  <div class="nt-progress"><div class="nt-progress__bar" style="width:${v}%;background:${c}"></div></div>
                </div>
              `
								)
								.join('')}
              <div style="border-top:1px solid var(--surface-border);margin-top:16px;padding-top:16px">
                <div class="muted" style="font-size:12px;margin-bottom:8px">Actividad reciente</div>
                <div class="row" style="gap:10px;margin-bottom:10px"><span class="nt-avatar nt-avatar--sm">MR</span><div style="font-size:13px">María R. creó factura <b>#NT-0284</b></div></div>
                <div class="row" style="gap:10px;margin-bottom:10px"><span class="nt-avatar nt-avatar--sm" style="background:var(--brand-soft);color:var(--nt-green-700)">LS</span><div style="font-size:13px">Luis S. cerró ticket <b>#4821</b></div></div>
                <div class="row" style="gap:10px"><span class="nt-avatar nt-avatar--sm" style="background:#f59e0b1a;color:#b45309">JT</span><div style="font-size:13px">Juan T. actualizó contrato</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dark Teleservices -->
      <div class="screen screen--dark">
        <aside class="screen__side">
          <div class="screen__brand"><span class="nt-logo" style="font-size:17px;color:#fff"><span class="nt-logo__mark"><svg viewBox="0 0 40 30"><circle cx="8" cy="22" r="3" fill="#1bb54a"/><circle cx="20" cy="20" r="3" fill="#0098d4"/><circle cx="28" cy="14" r="3" fill="#0098d4"/><circle cx="34" cy="6" r="2.5" fill="#1bb54a"/></svg></span>newtech</span></div>
          <div class="screen__section-label">Operación</div>
          <div class="screen__item screen__item--active"><i class="ti ti-headset"></i> En vivo</div>
          <div class="screen__item"><i class="ti ti-phone"></i> Llamadas</div>
          <div class="screen__item"><i class="ti ti-message-circle"></i> Chats <span class="nt-nav-item__count" style="margin-left:auto;background:#1b2330;color:#8892a0">12</span></div>
          <div class="screen__item"><i class="ti ti-ticket"></i> Tickets</div>
          <div class="screen__section-label">Analítica</div>
          <div class="screen__item"><i class="ti ti-chart-bar"></i> Desempeño</div>
          <div class="screen__item"><i class="ti ti-users"></i> Agentes</div>
        </aside>
        <div class="screen__main">
          <div class="screen__topbar">
            <div>
              <div class="muted" style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#8892a0">Newtech Teleservices</div>
              <div class="screen__title" style="color:#fff">Centro de operaciones</div>
            </div>
            <div class="row" style="margin-left:auto;gap:12px">
              <span class="nt-badge nt-badge--success nt-badge--dot" style="background:rgba(27,181,74,0.15);color:#6ee29a">Sistema en línea</span>
              <button class="nt-btn nt-btn--icon nt-btn--ghost" style="color:#b8c0cc"><i class="ti ti-bell"></i></button>
              <span class="nt-avatar">CT</span>
            </div>
          </div>

          <div class="grid grid--4" style="margin-bottom:20px">
            ${[
							['Llamadas activas', '48', '+12 en cola', 'up'],
							['AHT promedio', '4:32', '-18s vs ayer', 'up'],
							['SLA 80/20', '96%', 'dentro del objetivo', 'up'],
							['Agentes conectados', '34/38', '89% disponible', 'up'],
						]
							.map(
								([l, v, d]) => `
              <div class="nt-card kpi">
                <div class="kpi__label">${l}</div>
                <div class="kpi__value">${v}</div>
                <div class="kpi__delta kpi__delta--up"><i class="ti ti-arrow-up-right"></i> ${d}</div>
              </div>
            `
							)
							.join('')}
          </div>

          <div class="nt-card" style="padding:0;overflow:hidden">
            <div style="padding:16px 20px;border-bottom:1px solid var(--nt-ink-800);display:flex;justify-content:space-between;align-items:center">
              <div style="font-weight:700">Cola de llamadas · en tiempo real</div>
              <div class="row" style="gap:6px"><button class="nt-btn nt-btn--outline nt-btn--sm" style="border-color:#2f3a49;color:#b8c0cc;background:transparent"><i class="ti ti-refresh"></i> Actualizar</button></div>
            </div>
            <table class="nt-table">
              <thead>
                <tr><th>Cliente</th><th>Tipo</th><th>Agente</th><th>Espera</th><th>Estado</th></tr>
              </thead>
              <tbody>
                ${[
									[
										'Altice Dominicana',
										'Soporte N2',
										'María R.',
										'0:34',
										'success',
										'En curso',
									],
									[
										'Banco Popular',
										'Ventas',
										'Luis S.',
										'1:12',
										'info',
										'En curso',
									],
									['Claro', 'Retención', '—', '2:45', 'warn', 'En espera'],
									[
										'Cervecería Nacional',
										'Soporte N1',
										'Ana P.',
										'0:18',
										'success',
										'En curso',
									],
									[
										'Edenorte',
										'Facturación',
										'—',
										'3:22',
										'danger',
										'Abandonada',
									],
								]
									.map(
										([c, t, a, w, s, lb]) => `
                  <tr>
                    <td style="color:#fff;font-weight:600">${c}</td>
                    <td style="color:#b8c0cc">${t}</td>
                    <td style="color:#b8c0cc">${a}</td>
                    <td style="font-variant-numeric:tabular-nums;color:#fff">${w}</td>
                    <td><span class="nt-badge nt-badge--${s} nt-badge--dot">${lb}</span></td>
                  </tr>
                `
									)
									.join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  `;

	/* ---------- INJECT ---------- */
	main.innerHTML =
		colorSection +
		typeSection +
		spaceSection +
		componentsSection +
		iconsSection +
		brandSection +
		examplesSection;

	/* ---------- small interactivity ---------- */
	document.querySelectorAll('.nt-tab').forEach((tab) => {
		tab.addEventListener('click', (e) => {
			const group = e.target.closest('.nt-tabs');
			if (!group) return;
			group
				.querySelectorAll('.nt-tab')
				.forEach((t) => t.classList.remove('nt-tab--active'));
			e.target.classList.add('nt-tab--active');
		});
	});

	// spin keyframes (for loading button icon)
	const style = document.createElement('style');
	style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
	document.head.appendChild(style);
})();
